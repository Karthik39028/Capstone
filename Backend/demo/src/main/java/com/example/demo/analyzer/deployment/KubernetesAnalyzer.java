
package com.example.demo.analyzer.deployment;

import com.example.demo.model.deployment.DeploymentModel;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.*;

@Service
public class KubernetesAnalyzer implements DeploymentAnalyzer {

    @Override
    public boolean supports(String technology) {
        return technology != null
                && technology.equalsIgnoreCase("Kubernetes");
    }

    @Override
    public List<DeploymentModel> analyze(File file) {
        List<DeploymentModel> models = new ArrayList<>();

        if (file == null || !file.isFile() || !file.exists()) {
            return models;
        }

        Yaml yaml = new Yaml();

        try (InputStream input = new FileInputStream(file)) {
            for (Object document : yaml.loadAll(input)) {
                if (!(document instanceof Map)) {
                    continue;
                }

                Map<String, Object> root = castMap(document);
                DeploymentModel model = analyzeDocument(root, file);

                if (model != null) {
                    models.add(model);
                }
            }
        } catch (Exception e) {
            System.err.println(
                    "Kubernetes analysis failed for "
                            + file.getName() + ": " + e.getMessage()
            );
        }

        return models;
    }

    private DeploymentModel analyzeDocument(
            Map<String, Object> root, File file) {

        String kind = getString(root, "kind");
        if (kind == null || kind.trim().isEmpty()) {
            return null;
        }

        Map<String, Object> metadata = getMap(root, "metadata");
        Map<String, Object> spec = getMap(root, "spec");

        DeploymentModel model = new DeploymentModel();
        model.setTechnology("Kubernetes");

        // Use a stable path for now. DeploymentModelService should
        // replace this with the repository-relative path.
        model.setFilePath(file.getName());

        String name = getString(metadata, "name");
        String apiVersion = getString(root, "apiVersion");

        model.getResources().add(kind);

        if (name != null) {
            model.getResources().add("name:" + name);
        }

        if (apiVersion != null) {
            model.getResources().add("apiVersion:" + apiVersion);
        }

        if ("Service".equalsIgnoreCase(kind)) {
            analyzeService(spec, name, model);
        }

        if (isWorkload(kind)) {
            analyzeWorkload(kind, spec, model);
        }

        if ("Pod".equalsIgnoreCase(kind)) {
            analyzePodSpec(spec, model);
        }

        analyzeDependencies(root, kind, spec, model);
        analyzeVolumes(spec, kind, model);

        return model;
    }

    private boolean isWorkload(String kind) {
        return "Deployment".equalsIgnoreCase(kind)
                || "StatefulSet".equalsIgnoreCase(kind)
                || "DaemonSet".equalsIgnoreCase(kind)
                || "ReplicaSet".equalsIgnoreCase(kind)
                || "Job".equalsIgnoreCase(kind)
                || "CronJob".equalsIgnoreCase(kind);
    }

    private void analyzeWorkload(
            String kind,
            Map<String, Object> spec,
            DeploymentModel model) {

        if ("CronJob".equalsIgnoreCase(kind)) {
            Map<String, Object> jobTemplate =
                    getMap(spec, "jobTemplate");

            Map<String, Object> jobSpec =
                    getMap(jobTemplate, "spec");

            Map<String, Object> podTemplate =
                    getMap(jobSpec, "template");

            analyzePodTemplate(podTemplate, model);
            return;
        }

        if ("Deployment".equalsIgnoreCase(kind)
                || "StatefulSet".equalsIgnoreCase(kind)
                || "ReplicaSet".equalsIgnoreCase(kind)) {

            Integer replicas = getInteger(spec, "replicas");

            // Kubernetes defaults these workloads to one replica
            // when replicas is omitted.
            model.setReplicas(replicas != null ? replicas : 1);
        }

        if ("DaemonSet".equalsIgnoreCase(kind)) {
            model.getResources().add(
                    "replicaMode:one-pod-per-eligible-node"
            );
        }

        Map<String, Object> template = getMap(spec, "template");
        analyzePodTemplate(template, model);
    }

    private void analyzePodTemplate(
            Map<String, Object> template,
            DeploymentModel model) {

        Map<String, Object> podSpec = getMap(template, "spec");
        analyzePodSpec(podSpec, model);
    }

    private void analyzePodSpec(
            Map<String, Object> podSpec,
            DeploymentModel model) {

        List<Map<String, Object>> containers =
                getMapList(podSpec, "containers");

        for (Map<String, Object> container : containers) {
            String containerName = getString(container, "name");
            String image = getString(container, "image");

            if (containerName != null) {
                model.getContainers().add(containerName);
            }

            if (image != null) {
                model.getContainers().add("image:" + image);
            }

            analyzeContainerPorts(container, model);
            analyzeEnvironment(container, model);
            analyzeContainerResources(container, model);
            analyzeHealthChecks(container, model);
            analyzeVolumeMounts(container, model);
        }

        // Include init containers as well.
        List<Map<String, Object>> initContainers =
                getMapList(podSpec, "initContainers");

        for (Map<String, Object> container : initContainers) {
            String name = getString(container, "name");
            String image = getString(container, "image");

            if (name != null) {
                model.getContainers().add("init:" + name);
            }

            if (image != null) {
                model.getContainers().add("init-image:" + image);
            }

            analyzeEnvironment(container, model);
            analyzeContainerResources(container, model);
            analyzeHealthChecks(container, model);
        }

        // Pod-level scheduling and networking information.
        String serviceAccount =
                getString(podSpec, "serviceAccountName");

        if (serviceAccount != null) {
            model.getDependencies().add(
                    "ServiceAccount:" + serviceAccount
            );
        }

        Object hostNetwork = podSpec.get("hostNetwork");
        if (Boolean.TRUE.equals(hostNetwork)) {
            model.getNetworking().add("hostNetwork:true");
        }

        String nodeName = getString(podSpec, "nodeName");
        if (nodeName != null) {
            model.getNetworking().add("nodeName:" + nodeName);
        }
    }

    private void analyzeContainerPorts(
            Map<String, Object> container,
            DeploymentModel model) {

        for (Map<String, Object> port :
                getMapList(container, "ports")) {

            Object containerPort = port.get("containerPort");

            if (containerPort != null) {
                String name = getString(port, "name");
                String protocol = getString(port, "protocol");

                String value = "containerPort:" + containerPort;

                if (name != null) {
                    value += ",name:" + name;
                }

                if (protocol != null) {
                    value += ",protocol:" + protocol;
                }

                model.getPorts().add(value);
            }
        }
    }

    private void analyzeEnvironment(
            Map<String, Object> container,
            DeploymentModel model) {

        for (Map<String, Object> variable :
                getMapList(container, "env")) {

            String name = getString(variable, "name");
            if (name == null) {
                continue;
            }

            Object value = variable.get("value");

            if (value != null) {
                model.getEnvironment().put(name, String.valueOf(value));
                continue;
            }

            Map<String, Object> valueFrom =
                    getMap(variable, "valueFrom");

            Map<String, Object> secretRef =
                    getMap(valueFrom, "secretKeyRef");

            Map<String, Object> configMapRef =
                    getMap(valueFrom, "configMapKeyRef");

            String secretName = getString(secretRef, "name");
            String configMapName = getString(configMapRef, "name");

            // Do not expose Secret values; record only the reference.
            if (secretName != null) {
                model.getEnvironment().put(
                        name, "reference:Secret/" + secretName
                );
            } else if (configMapName != null) {
                model.getEnvironment().put(
                        name, "reference:ConfigMap/" + configMapName
                );
            } else if (!valueFrom.isEmpty()) {
                model.getEnvironment().put(name, "valueFrom");
            } else {
                model.getEnvironment().put(name, "unknown");
            }
        }

        for (Map<String, Object> envFrom :
                getMapList(container, "envFrom")) {

            Map<String, Object> configMapRef =
                    getMap(envFrom, "configMapRef");

            String configMapName = getString(configMapRef, "name");

            if (configMapName != null) {
                model.getDependencies().add(
                        "ConfigMap:" + configMapName
                );
            }

            Map<String, Object> secretRef =
                    getMap(envFrom, "secretRef");

            String secretName = getString(secretRef, "name");

            if (secretName != null) {
                model.getDependencies().add(
                        "Secret:" + secretName
                );
            }
        }
    }

    private void analyzeContainerResources(
            Map<String, Object> container,
            DeploymentModel model) {

        Map<String, Object> resources =
                getMap(container, "resources");

        Map<String, Object> requests =
                getMap(resources, "requests");

        Map<String, Object> limits =
                getMap(resources, "limits");

        appendResource(model, "cpu", "request", requests.get("cpu"));
        appendResource(model, "cpu", "limit", limits.get("cpu"));
        appendResource(model, "memory", "request", requests.get("memory"));
        appendResource(model, "memory", "limit", limits.get("memory"));
    }

    private void appendResource(
            DeploymentModel model,
            String resource,
            String type,
            Object value) {

        if (value == null) {
            return;
        }

        String entry = type + ":" + value;

        if ("cpu".equals(resource)) {
            model.setCpu(appendValue(model.getCpu(), entry));
        } else {
            model.setMemory(appendValue(model.getMemory(), entry));
        }
    }

    private String appendValue(String existing, String value) {
        return existing == null || existing.isEmpty()
                ? value
                : existing + ", " + value;
    }

    private void analyzeHealthChecks(
            Map<String, Object> container,
            DeploymentModel model) {

        for (String probe : Arrays.asList(
                "readinessProbe", "livenessProbe", "startupProbe")) {

            Map<String, Object> probeConfig = getMap(container, probe);

            if (!probeConfig.isEmpty()) {
                model.getHealthChecks().add(probe);
            }
        }
    }

    private void analyzeVolumeMounts(
            Map<String, Object> container,
            DeploymentModel model) {

        for (Map<String, Object> mount :
                getMapList(container, "volumeMounts")) {

            String name = getString(mount, "name");
            String path = getString(mount, "mountPath");

            if (name != null) {
                String value = "mount:" + name;

                if (path != null) {
                    value += "->" + path;
                }

                model.getStorage().add(value);
            }
        }
    }

    private void analyzeService(
            Map<String, Object> spec,
            String name,
            DeploymentModel model) {

        model.getServices().add(
                name != null ? name : "unnamed-service"
        );

        String type = getString(spec, "type");
        if (type != null) {
            model.getNetworking().add("serviceType:" + type);
        } else {
            model.getNetworking().add("serviceType:ClusterIP (default)");
        }

        for (Map<String, Object> port : getMapList(spec, "ports")) {
            Object servicePort = port.get("port");
            Object targetPort = port.get("targetPort");
            Object nodePort = port.get("nodePort");

            if (servicePort != null) {
                String value = "port:" + servicePort;

                if (targetPort != null) {
                    value += "->target:" + targetPort;
                }

                if (nodePort != null) {
                    value += ",nodePort:" + nodePort;
                }

                model.getPorts().add(value);
            }
        }

        Map<String, Object> selector = getMap(spec, "selector");

        for (Map.Entry<String, Object> entry : selector.entrySet()) {
            model.getDependencies().add(
                    "selector:" + entry.getKey()
                            + "=" + entry.getValue()
            );
        }
    }

    private void analyzeVolumes(
            Map<String, Object> spec,
            String kind,
            DeploymentModel model) {

        Map<String, Object> podSpec = spec;

        if (isWorkload(kind)) {
            if ("CronJob".equalsIgnoreCase(kind)) {
                Map<String, Object> jobTemplate =
                        getMap(spec, "jobTemplate");
                Map<String, Object> jobSpec =
                        getMap(jobTemplate, "spec");
                Map<String, Object> template =
                        getMap(jobSpec, "template");
                podSpec = getMap(template, "spec");
            } else {
                Map<String, Object> template = getMap(spec, "template");
                podSpec = getMap(template, "spec");
            }
        }

        for (Map<String, Object> volume : getMapList(podSpec, "volumes")) {
            String name = getString(volume, "name");

            if (name != null) {
                model.getStorage().add("volume:" + name);
            }

            Map<String, Object> pvc =
                    getMap(volume, "persistentVolumeClaim");

            String claimName = getString(pvc, "claimName");

            if (claimName != null) {
                model.getStorage().add("PVC:" + claimName);
            }

            Map<String, Object> configMap =
                    getMap(volume, "configMap");

            String configMapName = getString(configMap, "name");

            if (configMapName != null) {
                model.getDependencies().add(
                        "ConfigMap:" + configMapName
                );
            }

            Map<String, Object> secret =
                    getMap(volume, "secret");

            String secretName = getString(secret, "secretName");

            if (secretName != null) {
                model.getDependencies().add(
                        "Secret:" + secretName
                );
            }
        }
    }

    private void analyzeDependencies(
            Map<String, Object> root,
            String kind,
            Map<String, Object> spec,
            DeploymentModel model) {

        if ("Secret".equalsIgnoreCase(kind)
                || "ConfigMap".equalsIgnoreCase(kind)) {

            String name = getString(getMap(root, "metadata"), "name");

            if (name != null) {
                model.getResources().add("resourceName:" + name);
            }
        }

        // Also discover pod image-pull secrets.
        Map<String, Object> podSpec = spec;

        if (isWorkload(kind)) {
            if ("CronJob".equalsIgnoreCase(kind)) {
                Map<String, Object> jobTemplate =
                        getMap(spec, "jobTemplate");
                Map<String, Object> jobSpec =
                        getMap(jobTemplate, "spec");
                Map<String, Object> template =
                        getMap(jobSpec, "template");
                podSpec = getMap(template, "spec");
            } else {
                Map<String, Object> template = getMap(spec, "template");
                podSpec = getMap(template, "spec");
            }
        }

        for (Map<String, Object> pullSecret :
                getMapList(podSpec, "imagePullSecrets")) {

            String secretName = getString(pullSecret, "name");

            if (secretName != null) {
                model.getDependencies().add(
                        "ImagePullSecret:" + secretName
                );
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object object) {
        if (object instanceof Map) {
            return (Map<String, Object>) object;
        }
        return new LinkedHashMap<>();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(
            Map<String, Object> map, String key) {

        Object value = map.get(key);

        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }

        return new LinkedHashMap<>();
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private Integer getInteger(Map<String, Object> map, String key) {
        Object value = map.get(key);

        if (value instanceof Number) {
            return ((Number) value).intValue();
        }

        if (value != null) {
            try {
                return Integer.parseInt(String.valueOf(value));
            } catch (NumberFormatException ignored) {
                // Leave replicas unset when the value is invalid.
            }
        }

        return null;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getMapList(
            Map<String, Object> map, String key) {

        Object value = map.get(key);
        List<Map<String, Object>> result = new ArrayList<>();

        if (!(value instanceof List)) {
            return result;
        }

        for (Object item : (List<?>) value) {
            if (item instanceof Map) {
                result.add((Map<String, Object>) item);
            }
        }

        return result;
    }
}
