
package com.example.demo.model.deployment;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DeploymentModel {

    private String technology;
    private String filePath;

    private List<String> resources = new ArrayList<>();
    private List<String> services = new ArrayList<>();
    private List<String> containers = new ArrayList<>();

    private Integer replicas;
    private String cpu;
    private String memory;

    private List<String> ports = new ArrayList<>();
    private Map<String, String> environment = new LinkedHashMap<>();
    private List<String> networking = new ArrayList<>();
    private List<String> storage = new ArrayList<>();
    private List<String> healthChecks = new ArrayList<>();
    private List<String> dependencies = new ArrayList<>();

    public DeploymentModel() {
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public List<String> getResources() {
        return resources;
    }

    public void setResources(List<String> resources) {
        this.resources = resources != null
                ? resources : new ArrayList<>();
    }

    public List<String> getServices() {
        return services;
    }

    public void setServices(List<String> services) {
        this.services = services != null
                ? services : new ArrayList<>();
    }

    public List<String> getContainers() {
        return containers;
    }

    public void setContainers(List<String> containers) {
        this.containers = containers != null
                ? containers : new ArrayList<>();
    }

    public Integer getReplicas() {
        return replicas;
    }

    public void setReplicas(Integer replicas) {
        this.replicas = replicas;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getMemory() {
        return memory;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public List<String> getPorts() {
        return ports;
    }

    public void setPorts(List<String> ports) {
        this.ports = ports != null
                ? ports : new ArrayList<>();
    }

    public Map<String, String> getEnvironment() {
        return environment;
    }

    public void setEnvironment(Map<String, String> environment) {
        this.environment = environment != null
                ? environment : new LinkedHashMap<>();
    }

    public List<String> getNetworking() {
        return networking;
    }

    public void setNetworking(List<String> networking) {
        this.networking = networking != null
                ? networking : new ArrayList<>();
    }

    public List<String> getStorage() {
        return storage;
    }

    public void setStorage(List<String> storage) {
        this.storage = storage != null
                ? storage : new ArrayList<>();
    }

    public List<String> getHealthChecks() {
        return healthChecks;
    }

    public void setHealthChecks(List<String> healthChecks) {
        this.healthChecks = healthChecks != null
                ? healthChecks : new ArrayList<>();
    }

    public List<String> getDependencies() {
        return dependencies;
    }

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies != null
                ? dependencies : new ArrayList<>();
    }
}
