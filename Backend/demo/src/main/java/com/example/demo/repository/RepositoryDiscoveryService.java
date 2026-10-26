package com.example.demo.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class RepositoryDiscoveryService {

    @Autowired
    private RepositoryClassifierService classifierService;

    public List<RepositoryArtifact> discover(File repositoryRoot) {

        List<RepositoryArtifact> artifacts = new ArrayList<>();

        if (repositoryRoot == null
                || !repositoryRoot.exists()
                || !repositoryRoot.isDirectory()) {

            return artifacts;
        }

        scanDirectory(
                repositoryRoot,
                repositoryRoot.toPath(),
                artifacts
        );

        return artifacts;
    }

    private void scanDirectory(
            File directory,
            Path repositoryRoot,
            List<RepositoryArtifact> artifacts) {

        File[] files = directory.listFiles();

        if (files == null) {
            return;
        }

        for (File file : files) {

            // Ignore Git metadata
            if (file.isDirectory()
                    && file.getName().equals(".git")) {

                continue;
            }

            // Ignore common build/dependency directories
            if (file.isDirectory()
                    && (file.getName().equals("target")
                    || file.getName().equals("node_modules")
                    || file.getName().equals("build")
                    || file.getName().equals("dist"))) {

                continue;
            }

            // Recursively scan directories
            if (file.isDirectory()) {

                scanDirectory(
                        file,
                        repositoryRoot,
                        artifacts
                );

                continue;
            }

            String relativePath =
                    repositoryRoot
                            .relativize(file.toPath())
                            .toString()
                            .replace("\\", "/");

            RepositoryArtifact artifact =
                    classifierService.classify(
                            file,
                            relativePath
                    );

            artifacts.add(artifact);
        }
    }
}