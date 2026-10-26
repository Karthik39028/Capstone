package com.example.demo.analyzer.deployment;

import com.example.demo.model.deployment.DeploymentModel;

import java.io.File;
import java.util.List;

public interface DeploymentAnalyzer {

    boolean supports(String technology);

    List<DeploymentModel> analyze(File file);
}