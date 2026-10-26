package com.example.demo.repository;

import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Locale;

@Service
public class RepositoryClassifierService {

    public RepositoryArtifact classify(
            File file,
            String relativePath) {

        String fileName = file.getName();

        String lowerName =
                fileName.toLowerCase(Locale.ROOT);

        String normalizedPath =
                relativePath.replace("\\", "/");

        String lowerPath =
                normalizedPath.toLowerCase(Locale.ROOT);


        // =====================================================
        // APPLICATION SOURCE
        // =====================================================

        if (lowerName.endsWith(".java")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "Java",
                    "HIGH",
                    "Java application source file"
            );
        }

        if (lowerName.endsWith(".js")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "JavaScript",
                    "HIGH",
                    "JavaScript application source file"
            );
        }

        if (lowerName.endsWith(".jsx")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "React/JavaScript",
                    "HIGH",
                    "React JSX application source file"
            );
        }

        if (lowerName.endsWith(".ts")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "TypeScript",
                    "HIGH",
                    "TypeScript application source file"
            );
        }

        if (lowerName.endsWith(".tsx")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "React/TypeScript",
                    "HIGH",
                    "React TSX application source file"
            );
        }

        if (lowerName.endsWith(".py")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "Python",
                    "HIGH",
                    "Python application source file"
            );
        }

        if (lowerName.endsWith(".go")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "Go",
                    "HIGH",
                    "Go application source file"
            );
        }

        if (lowerName.endsWith(".cs")) {
            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "C#",
                    "HIGH",
                    "C# application source file"
            );
        }

        if (lowerName.endsWith(".cpp")
                || lowerName.endsWith(".c")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.APPLICATION,
                    "C/C++",
                    "HIGH",
                    "C/C++ application source file"
            );
        }


        // =====================================================
        // DOCKERFILE
        // =====================================================

        if (lowerName.equals("dockerfile")
                || lowerName.startsWith("dockerfile.")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Dockerfile",
                    "HIGH",
                    "Dockerfile container definition detected"
            );
        }


        // =====================================================
        // DOCKER COMPOSE
        // =====================================================

        if (lowerName.equals("docker-compose.yml")
                || lowerName.equals("docker-compose.yaml")
                || lowerName.equals("compose.yml")
                || lowerName.equals("compose.yaml")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Docker Compose",
                    "HIGH",
                    "Docker Compose configuration detected"
            );
        }


        // =====================================================
        // KUBERNETES
        // =====================================================

        boolean yamlFile =
                lowerName.endsWith(".yaml")
                        || lowerName.endsWith(".yml");

        boolean kubernetesDirectory =
                lowerPath.contains("/k8s/")
                        || lowerPath.contains("/kubernetes/")
                        || lowerPath.contains("/manifests/")
                        || lowerPath.startsWith("k8s/")
                        || lowerPath.startsWith("kubernetes/")
                        || lowerPath.startsWith("manifests/");

        if (kubernetesDirectory && yamlFile) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Kubernetes",
                    "MEDIUM",
                    "YAML file located in a Kubernetes-related directory"
            );
        }


        // =====================================================
        // TERRAFORM
        // =====================================================

        if (lowerName.endsWith(".tf")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Terraform",
                    "HIGH",
                    "Terraform infrastructure configuration detected"
            );
        }

        if (lowerName.endsWith(".tfvars")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Terraform",
                    "HIGH",
                    "Terraform variable configuration detected"
            );
        }


        // =====================================================
        // HELM
        // =====================================================

        /*
         * Do NOT classify every /templates/ directory as Helm.
         *
         * A Helm chart should have Chart.yaml in the chart root.
         */

        if (isHelmChartFile(file)) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Helm",
                    "HIGH",
                    "File belongs to a detected Helm chart"
            );
        }


        // =====================================================
        // KUSTOMIZE
        // =====================================================

        if (lowerName.equals("kustomization.yaml")
                || lowerName.equals("kustomization.yml")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Kustomize",
                    "HIGH",
                    "Kustomize configuration detected"
            );
        }


        // =====================================================
        // BICEP
        // =====================================================

        if (lowerName.endsWith(".bicep")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Bicep",
                    "HIGH",
                    "Azure Bicep infrastructure configuration detected"
            );
        }


        // =====================================================
        // PULUMI
        // =====================================================

        if (lowerName.equals("pulumi.yaml")
                || lowerName.equals("pulumi.yml")
                || lowerName.startsWith("pulumi.")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DEPLOYMENT,
                    "Pulumi",
                    "HIGH",
                    "Pulumi project configuration detected"
            );
        }


        // =====================================================
        // GITHUB ACTIONS
        // =====================================================

        if ((lowerPath.contains(".github/workflows/")
                || lowerPath.startsWith(".github/workflows/"))
                && yamlFile) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CICD,
                    "GitHub Actions",
                    "HIGH",
                    "GitHub Actions workflow detected"
            );
        }


        // =====================================================
        // GITLAB CI
        // =====================================================

        if (lowerName.equals(".gitlab-ci.yml")
                || lowerName.equals(".gitlab-ci.yaml")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CICD,
                    "GitLab CI",
                    "HIGH",
                    "GitLab CI pipeline configuration detected"
            );
        }


        // =====================================================
        // JENKINS
        // =====================================================

        if (lowerName.equals("jenkinsfile")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CICD,
                    "Jenkins",
                    "HIGH",
                    "Jenkins pipeline definition detected"
            );
        }


        // =====================================================
        // DOCUMENTATION
        // =====================================================

        if (lowerName.equals("readme.md")
                || lowerName.equals("license")
                || lowerName.equals("license.txt")
                || lowerName.endsWith(".md")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.DOCUMENTATION,
                    "Markdown",
                    "HIGH",
                    "Documentation file detected"
            );
        }


        // =====================================================
        // CONFIGURATION
        // =====================================================

        if (lowerName.endsWith(".properties")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "Properties",
                    "HIGH",
                    "Properties configuration file detected"
            );
        }

        if (lowerName.endsWith(".conf")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "Configuration",
                    "MEDIUM",
                    "Configuration file detected"
            );
        }

        if (lowerName.endsWith(".ini")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "INI",
                    "HIGH",
                    "INI configuration file detected"
            );
        }

        if (lowerName.equals(".env")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "Environment Variables",
                    "HIGH",
                    "Environment configuration file detected"
            );
        }


        // =====================================================
        // BUILD CONFIGURATION
        // =====================================================

        if (lowerName.equals("pom.xml")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "Maven",
                    "HIGH",
                    "Maven build configuration detected"
            );
        }

        if (lowerName.equals("build.gradle")
                || lowerName.equals("build.gradle.kts")
                || lowerName.equals("settings.gradle")
                || lowerName.equals("settings.gradle.kts")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "Gradle",
                    "HIGH",
                    "Gradle build configuration detected"
            );
        }


        // =====================================================
        // GENERIC JSON
        // =====================================================

        if (lowerName.endsWith(".json")) {

            return artifact(
                    fileName,
                    relativePath,
                    ArtifactCategory.CONFIGURATION,
                    "JSON",
                    "MEDIUM",
                    "JSON configuration/data file detected"
            );
        }


        // =====================================================
        // UNKNOWN
        // =====================================================

        return artifact(
                fileName,
                relativePath,
                ArtifactCategory.UNKNOWN,
                "Unknown",
                "LOW",
                "No supported artifact pattern detected"
        );
    }


    // =========================================================
    // HELM DETECTION
    // =========================================================

    private boolean isHelmChartFile(File file) {

        File currentDirectory =
                file.isDirectory()
                        ? file
                        : file.getParentFile();

        while (currentDirectory != null) {

            File chartFile =
                    new File(
                            currentDirectory,
                            "Chart.yaml"
                    );

            if (chartFile.exists()
                    && chartFile.isFile()) {

                return true;
            }

            currentDirectory =
                    currentDirectory.getParentFile();
        }

        return false;
    }


    // =========================================================
    // ARTIFACT FACTORY
    // =========================================================

    private RepositoryArtifact artifact(
            String fileName,
            String path,
            ArtifactCategory category,
            String technology,
            String confidence,
            String reason) {

        return new RepositoryArtifact(
                fileName,
                path,
                category,
                technology,
                confidence,
                reason
        );
    }
}