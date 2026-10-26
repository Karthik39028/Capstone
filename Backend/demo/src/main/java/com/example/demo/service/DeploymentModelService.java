
package com.example.demo.service;

import com.example.demo.analyzer.deployment.DeploymentAnalyzer;
import com.example.demo.model.deployment.DeploymentModel;
import com.example.demo.repository.RepositoryArtifact;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
public class DeploymentModelService {

    @Autowired
    private List<DeploymentAnalyzer> analyzers;

    public List<DeploymentModel> analyze(
            File repositoryRoot,
            List<RepositoryArtifact> artifacts) {

        List<DeploymentModel> deploymentModels =
                new ArrayList<>();

        if (repositoryRoot == null || artifacts == null) {
            return deploymentModels;
        }

        for (RepositoryArtifact artifact : artifacts) {

            if (artifact == null) {
                continue;
            }

            if (artifact.getCategory() == null
                    || !artifact.getCategory().name()
                    .equals("DEPLOYMENT")) {
                continue;
            }

            String technology = artifact.getTechnology();

            for (DeploymentAnalyzer analyzer : analyzers) {

                if (!analyzer.supports(technology)) {
                    continue;
                }

                File deploymentFile = new File(
                        repositoryRoot,
                        artifact.getFilePath()
                );

                if (!deploymentFile.exists()
                        || !deploymentFile.isFile()) {
                    continue;
                }

                List<DeploymentModel> models =
                        analyzer.analyze(deploymentFile);

                if (models != null) {
                    for (DeploymentModel model : models) {
                        if (model != null) {
                            // Preserve the repository-relative path.
                            model.setFilePath(artifact.getFilePath());
                            deploymentModels.add(model);
                        }
                    }
                }

                // Avoid running multiple matching analyzers
                // on the same artifact.
                break;
            }
        }

        return deploymentModels;
    }
}
