package com.example.demo.service;

import com.example.demo.ast.AstParsingService;
import com.example.demo.dto.StaticAnalysisResult;
import com.example.demo.model.deployment.DeploymentModel;
import com.example.demo.repository.ArtifactCategory;
import com.example.demo.repository.RepositoryArtifact;
import com.example.demo.repository.RepositoryDiscoveryService;
import org.eclipse.jgit.api.Git;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AstAnalysisService {

    @Autowired
    private AstParsingService astParsingService;

    @Autowired
    private RepositoryDiscoveryService repositoryDiscoveryService;

    @Autowired
    private DeploymentModelService deploymentModelService;


    /**
     * Main GitHub repository analysis method.
     *
     * Flow:
     *
     * GitHub URL
     *     ↓
     * Clone repository
     *     ↓
     * Discover repository artifacts
     *     ↓
     * Classify artifacts
     *     ↓
     * Analyze deployment artifacts
     *     ↓
     * Select Java application files
     *     ↓
     * Existing Java AST analysis
     *     ↓
     * Combine results
     */
    public Map<String, Object> analyzeGitHubRepo(String githubUrl) {

        Map<String, Object> result =
                new LinkedHashMap<>();

        Path tempDir = null;

        try {

            // =====================================================
            // 1. VALIDATE URL
            // =====================================================

            if (githubUrl == null ||
                    githubUrl.trim().isEmpty()) {

                result.put(
                        "status",
                        "error"
                );

                result.put(
                        "message",
                        "GitHub repository URL is required."
                );

                return result;
            }


            // =====================================================
            // 2. CREATE TEMP DIRECTORY
            // =====================================================

            tempDir =
                    Files.createTempDirectory(
                            "capstone-repo-"
                    );

            File repoFolder =
                    tempDir.toFile();


            // =====================================================
            // 3. CLONE GITHUB REPOSITORY
            // =====================================================

            System.out.println(
                    "Cloning repository: " + githubUrl
            );

            Git git =
                    Git.cloneRepository()
                            .setURI(githubUrl)
                            .setDirectory(repoFolder)
                            .call();

            git.close();


            // =====================================================
            // 4. DISCOVER REPOSITORY
            // =====================================================

            System.out.println(
                    "Starting repository discovery..."
            );

            List<RepositoryArtifact> artifacts =
                    repositoryDiscoveryService.discover(
                            repoFolder
                    );

            System.out.println(
                    "Discovered artifacts: "
                            + artifacts.size()
            );


            // =====================================================
            // 5. ANALYZE DEPLOYMENT ARTIFACTS
            // =====================================================

            List<DeploymentModel> deploymentModels =
                    deploymentModelService.analyze(
                            repoFolder,
                            artifacts
                    );

            System.out.println(
                    "Deployment models generated: "
                            + deploymentModels.size()
            );


            // =====================================================
            // PRINT DISCOVERED ARTIFACTS
            // =====================================================

            for (RepositoryArtifact artifact : artifacts) {

                System.out.println(
                        artifact.getCategory()
                                + " / "
                                + artifact.getTechnology()
                                + " -> "
                                + artifact.getFilePath()
                );
            }


            // =====================================================
            // 6. BUILD ARTIFACT SUMMARY
            // =====================================================

            Map<String, Integer> artifactSummary =
                    new LinkedHashMap<>();

            artifactSummary.put(
                    "APPLICATION",
                    0
            );

            artifactSummary.put(
                    "DEPLOYMENT",
                    0
            );

            artifactSummary.put(
                    "CICD",
                    0
            );

            artifactSummary.put(
                    "CONFIGURATION",
                    0
            );

            artifactSummary.put(
                    "DOCUMENTATION",
                    0
            );

            artifactSummary.put(
                    "UNKNOWN",
                    0
            );


            for (RepositoryArtifact artifact : artifacts) {

                if (artifact.getCategory() == null) {
                    continue;
                }

                String category =
                        artifact.getCategory().name();

                artifactSummary.put(
                        category,
                        artifactSummary.getOrDefault(
                                category,
                                0
                        ) + 1
                );
            }


            // =====================================================
            // 7. BUILD TECHNOLOGY SUMMARY
            // =====================================================

            Map<String, Integer> technologySummary =
                    new LinkedHashMap<>();

            for (RepositoryArtifact artifact : artifacts) {

                String technology =
                        artifact.getTechnology();

                if (technology == null ||
                        technology.trim().isEmpty()) {

                    continue;
                }

                technologySummary.put(
                        technology,
                        technologySummary.getOrDefault(
                                technology,
                                0
                        ) + 1
                );
            }


            // =====================================================
            // 8. SELECT JAVA APPLICATION FILES
            // =====================================================

            List<File> javaFiles =
                    new ArrayList<>();

            for (RepositoryArtifact artifact : artifacts) {

                if (artifact.getCategory()
                        != ArtifactCategory.APPLICATION) {

                    continue;
                }

                String technology =
                        artifact.getTechnology();

                if (technology == null ||
                        !technology.equalsIgnoreCase("Java")) {

                    continue;
                }

                String path =
                        artifact.getFilePath();

                if (path == null) {
                    continue;
                }

                if (!path.toLowerCase()
                        .endsWith(".java")) {

                    continue;
                }

                File javaFile =
                        new File(
                                repoFolder,
                                path
                        );

                if (javaFile.exists()
                        && javaFile.isFile()) {

                    javaFiles.add(javaFile);
                }
            }


            System.out.println(
                    "Java application files: "
                            + javaFiles.size()
            );


            // =====================================================
            // 9. ANALYZE JAVA FILES
            // =====================================================

            List<Map<String, Object>> fileResults =
                    new ArrayList<>();

            int totalLines = 0;
            int totalClasses = 0;
            int totalMethods = 0;
            int totalParameters = 0;
            int totalVariables = 0;

            int totalCyclomatic = 0;
            int totalCognitive = 0;

            int maximumNesting = 0;
            int longestMethod = 0;

            String highestRiskMethod = "None";
            int highestRiskComplexity = 0;

            String highestRiskFile = "None";

            List<String> allCodeSmells =
                    new ArrayList<>();


            for (File javaFile : javaFiles) {

                try {

                    // ---------------------------------------------
                    // READ SOURCE
                    // ---------------------------------------------

                    String sourceCode =
                            Files.readString(
                                    javaFile.toPath()
                            );


                    // ---------------------------------------------
                    // RELATIVE PATH
                    // ---------------------------------------------

                    String relativePath =
                            repoFolder.toPath()
                                    .relativize(
                                            javaFile.toPath()
                                    )
                                    .toString()
                                    .replace(
                                            "\\",
                                            "/"
                                    );


                    // ---------------------------------------------
                    // AST ANALYSIS
                    // ---------------------------------------------

                    StaticAnalysisResult analysis =
                            astParsingService.analyzeJavaCode(
                                    sourceCode,
                                    javaFile.getName(),
                                    relativePath
                            );


                    // ---------------------------------------------
                    // FILE RESULT
                    // ---------------------------------------------

                    Map<String, Object> fileResult =
                            new LinkedHashMap<>();


                    fileResult.put(
                            "fileName",
                            analysis.getFileName()
                    );

                    fileResult.put(
                            "filePath",
                            analysis.getFilePath()
                    );

                    fileResult.put(
                            "artifactCategory",
                            "APPLICATION"
                    );

                    fileResult.put(
                            "technology",
                            "Java"
                    );

                    fileResult.put(
                            "language",
                            "JAVA"
                    );

                    fileResult.put(
                            "linesOfCode",
                            analysis.getLinesOfCode()
                    );

                    fileResult.put(
                            "classCount",
                            analysis.getClassCount()
                    );

                    fileResult.put(
                            "methodCount",
                            analysis.getMethodCount()
                    );

                    fileResult.put(
                            "parameterCount",
                            analysis.getParameterCount()
                    );

                    fileResult.put(
                            "variableCount",
                            analysis.getVariableCount()
                    );

                    fileResult.put(
                            "cyclomaticComplexity",
                            analysis.getCyclomaticComplexity()
                    );

                    fileResult.put(
                            "cognitiveComplexity",
                            analysis.getCognitiveComplexity()
                    );

                    fileResult.put(
                            "maximumNestingDepth",
                            analysis.getMaximumNestingDepth()
                    );

                    fileResult.put(
                            "longestMethodLines",
                            analysis.getLongestMethodLines()
                    );

                    fileResult.put(
                            "highestRiskMethod",
                            analysis.getHighestRiskMethod()
                    );

                    fileResult.put(
                            "highestRiskMethodComplexity",
                            analysis.getHighestRiskMethodComplexity()
                    );

                    fileResult.put(
                            "riskLevel",
                            analysis.getRiskLevel()
                    );

                    fileResult.put(
                            "codeSmells",
                            analysis.getCodeSmells()
                    );


                    // Keep source code available
                    // for later investigation/AI explanation.

                    fileResult.put(
                            "fileContent",
                            sourceCode
                    );


                    fileResults.add(
                            fileResult
                    );


                    // ---------------------------------------------
                    // PROJECT TOTALS
                    // ---------------------------------------------

                    totalLines +=
                            analysis.getLinesOfCode();

                    totalClasses +=
                            analysis.getClassCount();

                    totalMethods +=
                            analysis.getMethodCount();

                    totalParameters +=
                            analysis.getParameterCount();

                    totalVariables +=
                            analysis.getVariableCount();

                    totalCyclomatic +=
                            analysis.getCyclomaticComplexity();

                    totalCognitive +=
                            analysis.getCognitiveComplexity();


                    maximumNesting =
                            Math.max(
                                    maximumNesting,
                                    analysis.getMaximumNestingDepth()
                            );


                    longestMethod =
                            Math.max(
                                    longestMethod,
                                    analysis.getLongestMethodLines()
                            );


                    // ---------------------------------------------
                    // HIGHEST RISK METHOD
                    // ---------------------------------------------

                    if (analysis
                            .getHighestRiskMethodComplexity()
                            > highestRiskComplexity) {

                        highestRiskComplexity =
                                analysis
                                        .getHighestRiskMethodComplexity();

                        highestRiskMethod =
                                analysis
                                        .getHighestRiskMethod();

                        highestRiskFile =
                                analysis
                                        .getFileName();
                    }


                    // ---------------------------------------------
                    // CODE SMELLS
                    // ---------------------------------------------

                    if (analysis.getCodeSmells() != null) {

                        allCodeSmells.addAll(
                                analysis.getCodeSmells()
                        );
                    }


                } catch (Exception fileError) {

                    System.out.println(
                            "Skipping Java file: "
                                    + javaFile.getName()
                                    + " | "
                                    + fileError.getMessage()
                    );
                }
            }


            // =====================================================
            // 10. CALCULATE AVERAGES
            // =====================================================

            double averageCyclomatic =
                    totalMethods > 0
                            ? (double) totalCyclomatic
                            / totalMethods
                            : 0;


            double averageCognitive =
                    totalMethods > 0
                            ? (double) totalCognitive
                            / totalMethods
                            : 0;


            // =====================================================
            // 11. BUILD RESPONSE
            // =====================================================

            result.put(
                    "status",
                    "success"
            );

            result.put(
                    "message",
                    "Repository discovery and analysis completed successfully."
            );


            // =====================================================
            // REPOSITORY INFORMATION
            // =====================================================

            result.put(
                    "repositoryUrl",
                    githubUrl
            );

            result.put(
                    "totalFiles",
                    artifacts.size()
            );

            result.put(
                    "applicationFileCount",
                    artifactSummary.getOrDefault(
                            "APPLICATION",
                            0
                    )
            );

            result.put(
                    "javaFileCount",
                    javaFiles.size()
            );

            result.put(
                    "artifactCount",
                    artifacts.size()
            );

            result.put(
                    "artifactSummary",
                    artifactSummary
            );

            result.put(
                    "technologySummary",
                    technologySummary
            );

            result.put(
                    "artifacts",
                    artifacts
            );


            // =====================================================
            // DEPLOYMENT ANALYSIS
            // =====================================================

            result.put(
                    "deploymentModels",
                    deploymentModels
            );


            // =====================================================
            // JAVA PROJECT METRICS
            // =====================================================

            result.put(
                    "totalLinesOfCode",
                    totalLines
            );

            result.put(
                    "totalClasses",
                    totalClasses
            );

            result.put(
                    "totalMethods",
                    totalMethods
            );

            result.put(
                    "totalParameters",
                    totalParameters
            );

            result.put(
                    "totalVariables",
                    totalVariables
            );

            result.put(
                    "totalCyclomaticComplexity",
                    totalCyclomatic
            );

            result.put(
                    "totalCognitiveComplexity",
                    totalCognitive
            );

            result.put(
                    "averageCyclomaticComplexity",
                    Math.round(
                            averageCyclomatic * 100.0
                    ) / 100.0
            );

            result.put(
                    "averageCognitiveComplexity",
                    Math.round(
                            averageCognitive * 100.0
                    ) / 100.0
            );

            result.put(
                    "maximumNestingDepth",
                    maximumNesting
            );

            result.put(
                    "longestMethodLines",
                    longestMethod
            );


            // =====================================================
            // RISK INFORMATION
            // =====================================================

            result.put(
                    "highestRiskMethod",
                    highestRiskMethod
            );

            result.put(
                    "highestRiskMethodComplexity",
                    highestRiskComplexity
            );

            result.put(
                    "highestRiskFile",
                    highestRiskFile
            );

            result.put(
                    "codeSmellCount",
                    allCodeSmells.size()
            );

            result.put(
                    "codeSmells",
                    allCodeSmells
            );


            // =====================================================
            // HEALTH SCORE
            // =====================================================

            // Only calculate health when Java application
            // files were actually analyzed.

            if (!javaFiles.isEmpty()) {

                int healthScore =
                        calculateHealthScore(
                                averageCyclomatic,
                                averageCognitive,
                                allCodeSmells.size(),
                                maximumNesting
                        );

                result.put(
                        "healthScore",
                        healthScore
                );
            }


            // =====================================================
            // INDIVIDUAL JAVA FILE RESULTS
            // =====================================================

            result.put(
                    "files",
                    fileResults
            );


            // =====================================================
            // BACKWARD COMPATIBILITY
            // =====================================================

            if (!fileResults.isEmpty()) {

                Map<String, Object> highestRisk =
                        fileResults.get(0);


                for (Map<String, Object> file :
                        fileResults) {

                    Object complexity =
                            file.get(
                                    "highestRiskMethodComplexity"
                            );


                    Object currentHighest =
                            highestRisk.get(
                                    "highestRiskMethodComplexity"
                            );


                    if (complexity instanceof Number
                            && currentHighest instanceof Number
                            && ((Number) complexity).intValue()
                            > ((Number) currentHighest).intValue()) {

                        highestRisk = file;
                    }
                }


                result.put(
                        "targetFile",
                        highestRisk.get(
                                "fileName"
                        )
                );


                result.put(
                        "targetMethod",
                        highestRisk.get(
                                "highestRiskMethod"
                        )
                );


                result.put(
                        "complexityScore",
                        highestRisk.get(
                                "highestRiskMethodComplexity"
                        )
                );


                result.put(
                        "fileContent",
                        highestRisk.get(
                                "fileContent"
                        )
                );


                result.put(
                        "antiPattern",
                        highestRisk.get(
                                "riskLevel"
                        )
                );


                // Get start/end lines

                addTargetMethodLines(
                        highestRisk,
                        repoFolder
                );
            }


            return result;


        } catch (Exception e) {

            e.printStackTrace();


            result.put(
                    "status",
                    "error"
            );


            result.put(
                    "message",
                    "Failed to analyze repository: "
                            + e.getMessage()
            );


            return result;


        } finally {

            // =====================================================
            // CLEAN TEMP DIRECTORY
            // =====================================================

            if (tempDir != null) {

                deleteDirectory(
                        tempDir.toFile()
                );
            }
        }
    }


    // =============================================================
    // HEALTH SCORE
    // =============================================================

    private int calculateHealthScore(
            double averageCyclomatic,
            double averageCognitive,
            int codeSmellCount,
            int maximumNesting) {

        double score = 100;


        // Complexity penalty

        if (averageCyclomatic > 10) {

            score -= 30;

        } else if (averageCyclomatic > 5) {

            score -= 15;
        }


        // Cognitive complexity penalty

        if (averageCognitive > 15) {

            score -= 25;

        } else if (averageCognitive > 8) {

            score -= 10;
        }


        // Code smell penalty

        score -= Math.min(
                codeSmellCount * 3,
                25
        );


        // Nesting penalty

        if (maximumNesting > 6) {

            score -= 15;

        } else if (maximumNesting > 4) {

            score -= 8;
        }


        return Math.max(
                0,
                Math.min(
                        100,
                        (int) Math.round(score)
                )
        );
    }


    // =============================================================
    // TARGET METHOD LINES
    // =============================================================

    private void addTargetMethodLines(
            Map<String, Object> targetFile,
            File repoFolder) {

        try {

            String relativePath =
                    (String) targetFile.get(
                            "filePath"
                    );


            if (relativePath == null) {
                return;
            }


            File file =
                    new File(
                            repoFolder,
                            relativePath
                    );


            if (!file.exists()) {
                return;
            }


            String sourceCode =
                    Files.readString(
                            file.toPath()
                    );


            var cu =
                    com.github.javaparser.StaticJavaParser
                            .parse(sourceCode);


            String targetMethod =
                    (String) targetFile.get(
                            "highestRiskMethod"
                    );


            if (targetMethod == null) {
                return;
            }


            cu.findAll(
                            com.github.javaparser.ast.body
                                    .MethodDeclaration.class
                    )
                    .stream()
                    .filter(method ->
                            method.getNameAsString()
                                    .equals(targetMethod)
                    )
                    .findFirst()
                    .ifPresent(method ->
                            method.getRange()
                                    .ifPresent(range -> {

                                        targetFile.put(
                                                "startLine",
                                                range.begin.line
                                        );

                                        targetFile.put(
                                                "endLine",
                                                range.end.line
                                        );
                                    })
                    );


        } catch (Exception ignored) {

            // Do not fail the complete repository
            // analysis if line extraction fails.
        }
    }


    // =============================================================
    // DELETE TEMP DIRECTORY
    // =============================================================

    private void deleteDirectory(
            File directory) {

        if (directory == null ||
                !directory.exists()) {

            return;
        }


        File[] files =
                directory.listFiles();


        if (files != null) {

            for (File file : files) {

                if (file.isDirectory()) {

                    deleteDirectory(
                            file
                    );

                } else {

                    file.delete();
                }
            }
        }


        directory.delete();
    }
}