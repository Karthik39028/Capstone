package com.example.demo.ast;

import com.example.demo.dto.StaticAnalysisResult;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.VariableDeclarator;
import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.expr.ConditionalExpr;
import com.github.javaparser.ast.stmt.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AstParsingService {

    /**
     * Main static analysis method.
     *
     * Analyzes one Java source file using JavaParser AST
     * and returns software quality metrics.
     */
    public StaticAnalysisResult analyzeJavaCode(
            String javaCode,
            String fileName,
            String filePath) {

        CompilationUnit cu = StaticJavaParser.parse(javaCode);

        StaticAnalysisResult result = new StaticAnalysisResult();

        // =========================================================
        // BASIC METRICS
        // =========================================================

        result.setFileName(fileName);
        result.setFilePath(filePath);

        // Lines of code
        result.setLinesOfCode(
                calculateLOC(javaCode)
        );

        // Number of classes/interfaces
        result.setClassCount(
                cu.findAll(
                        ClassOrInterfaceDeclaration.class
                ).size()
        );

        // Number of methods
        result.setMethodCount(
                cu.findAll(
                        MethodDeclaration.class
                ).size()
        );

        // Total parameters
        result.setParameterCount(
                calculateParameterCount(cu)
        );

        // Variables
        result.setVariableCount(
                cu.findAll(
                        VariableDeclarator.class
                ).size()
        );


        // =========================================================
        // COMPLEXITY
        // =========================================================

        int totalCyclomatic = 0;
        int totalCognitive = 0;

        int highestMethodComplexity = 0;
        String highestRiskMethod = "None";

        int maximumNestingDepth = 0;
        int longestMethodLines = 0;

        List<String> codeSmells =
                new ArrayList<>();


        // =========================================================
        // ANALYZE EACH METHOD
        // =========================================================

        for (MethodDeclaration method :
                cu.findAll(MethodDeclaration.class)) {

            // ---------------------------------------------
            // Cyclomatic complexity
            // ---------------------------------------------

            int cyclomatic =
                    calculateMethodCyclomaticComplexity(
                            method
                    );


            // ---------------------------------------------
            // Cognitive complexity
            // ---------------------------------------------

            int cognitive =
                    calculateMethodCognitiveComplexity(
                            method
                    );


            totalCyclomatic += cyclomatic;
            totalCognitive += cognitive;


            // ---------------------------------------------
            // Highest-risk method
            // ---------------------------------------------

            if (cyclomatic > highestMethodComplexity) {

                highestMethodComplexity =
                        cyclomatic;

                highestRiskMethod =
                        method.getNameAsString();
            }


            // ---------------------------------------------
            // Maximum nesting depth
            // ---------------------------------------------

            int nestingDepth =
                    calculateMaximumNestingDepth(
                            method
                    );

            maximumNestingDepth =
                    Math.max(
                            maximumNestingDepth,
                            nestingDepth
                    );


            // ---------------------------------------------
            // Longest method
            // ---------------------------------------------

            if (method.getRange().isPresent()) {

                int methodLines =
                        method.getRange().get().end.line
                                - method.getRange().get().begin.line
                                + 1;

                if (methodLines > longestMethodLines) {

                    longestMethodLines =
                            methodLines;
                }
            }


            // ---------------------------------------------
            // Code smells
            // ---------------------------------------------

            detectMethodSmells(
                    method,
                    cyclomatic,
                    cognitive,
                    nestingDepth,
                    codeSmells
            );
        }


        // =========================================================
        // NO METHODS CASE
        // =========================================================

        if (cu.findAll(MethodDeclaration.class).isEmpty()) {

            totalCyclomatic = 0;
            totalCognitive = 0;

            highestMethodComplexity = 0;

            highestRiskMethod = "None";

            maximumNestingDepth = 0;

            longestMethodLines = 0;
        }


        // =========================================================
        // SET RESULTS
        // =========================================================

        result.setCyclomaticComplexity(
                totalCyclomatic
        );

        result.setCognitiveComplexity(
                totalCognitive
        );

        result.setMaximumNestingDepth(
                maximumNestingDepth
        );

        result.setLongestMethodLines(
                longestMethodLines
        );

        result.setHighestRiskMethod(
                highestRiskMethod
        );

        result.setHighestRiskMethodComplexity(
                highestMethodComplexity
        );

        result.setCodeSmells(
                codeSmells
        );


        // =========================================================
        // RISK LEVEL
        // =========================================================

        result.setRiskLevel(
                calculateRiskLevel(
                        highestMethodComplexity,
                        maximumNestingDepth,
                        longestMethodLines,
                        codeSmells
                )
        );


        return result;
    }


    // =============================================================
    // LINES OF CODE
    // =============================================================

    /**
     * Counts non-empty and non-comment lines.
     */
    private int calculateLOC(String javaCode) {

        int loc = 0;

        String[] lines =
                javaCode.split("\\R");

        boolean insideBlockComment = false;


        for (String line : lines) {

            String trimmed =
                    line.trim();


            // Empty line
            if (trimmed.isEmpty()) {
                continue;
            }


            // -----------------------------------------------------
            // Block comment
            // -----------------------------------------------------

            if (insideBlockComment) {

                if (trimmed.endsWith("*/")) {

                    insideBlockComment = false;
                }

                continue;
            }


            // Start of block comment
            if (trimmed.startsWith("/*")) {

                if (!trimmed.endsWith("*/")) {

                    insideBlockComment = true;
                }

                continue;
            }


            // Single-line comment
            if (trimmed.startsWith("//")) {

                continue;
            }


            // Actual source-code line
            loc++;
        }


        return loc;
    }


    // =============================================================
    // PARAMETER COUNT
    // =============================================================

    /**
     * Counts all parameters from all methods.
     */
    private int calculateParameterCount(
            CompilationUnit cu) {

        int count = 0;


        for (MethodDeclaration method :
                cu.findAll(MethodDeclaration.class)) {

            count +=
                    method.getParameters().size();
        }


        return count;
    }


    // =============================================================
    // CYCLOMATIC COMPLEXITY
    // =============================================================

    /**
     * Calculates cyclomatic complexity for one method.
     *
     * Base complexity = 1
     *
     * Additional decision points:
     * - if
     * - for
     * - foreach
     * - while
     * - do while
     * - catch
     * - ternary
     * - switch case
     * - logical AND
     * - logical OR
     */
    private int calculateMethodCyclomaticComplexity(
            MethodDeclaration method) {

        int complexity = 1;


        // if
        complexity +=
                method.findAll(
                        IfStmt.class
                ).size();


        // for
        complexity +=
                method.findAll(
                        ForStmt.class
                ).size();


        // foreach
        complexity +=
                method.findAll(
                        ForEachStmt.class
                ).size();


        // while
        complexity +=
                method.findAll(
                        WhileStmt.class
                ).size();


        // do while
        complexity +=
                method.findAll(
                        DoStmt.class
                ).size();


        // catch
        complexity +=
                method.findAll(
                        CatchClause.class
                ).size();


        // ternary
        complexity +=
                method.findAll(
                        ConditionalExpr.class
                ).size();


        // switch cases
        for (SwitchEntry entry :
                method.findAll(
                        SwitchEntry.class
                )) {

            // Do not count default
            if (entry.getLabels().isNonEmpty()) {

                complexity++;
            }
        }


        // Logical AND / OR
        for (BinaryExpr expression :
                method.findAll(
                        BinaryExpr.class
                )) {

            if (expression.getOperator()
                    == BinaryExpr.Operator.AND
                    ||
                    expression.getOperator()
                            == BinaryExpr.Operator.OR) {

                complexity++;
            }
        }


        return complexity;
    }


    // =============================================================
    // COGNITIVE COMPLEXITY
    // =============================================================

    /**
     * Calculates cognitive complexity for one method.
     *
     * This is a project-level heuristic based on:
     * - control structures
     * - nesting
     * - ternary operators
     * - logical operators
     */
    private int calculateMethodCognitiveComplexity(
            MethodDeclaration method) {

        int[] complexity = {0};


        calculateCognitiveNode(
                method,
                0,
                complexity
        );


        return complexity[0];
    }


    /**
     * Recursively traverses the AST.
     */
    private void calculateCognitiveNode(
            Node node,
            int nestingLevel,
            int[] complexity) {


        boolean controlStructure =
                node instanceof IfStmt
                        || node instanceof ForStmt
                        || node instanceof ForEachStmt
                        || node instanceof WhileStmt
                        || node instanceof DoStmt
                        || node instanceof SwitchStmt
                        || node instanceof CatchClause;


        // ---------------------------------------------------------
        // Control structure
        // ---------------------------------------------------------

        if (controlStructure) {

            // Basic complexity
            complexity[0]++;


            // Nesting penalty
            complexity[0] +=
                    nestingLevel;


            // Traverse children
            for (Node child :
                    node.getChildNodes()) {

                calculateCognitiveNode(
                        child,
                        nestingLevel + 1,
                        complexity
                );
            }


            return;
        }


        // ---------------------------------------------------------
        // Ternary operator
        // ---------------------------------------------------------

        if (node instanceof ConditionalExpr) {

            complexity[0]++;
        }


        // ---------------------------------------------------------
        // Logical AND / OR
        // ---------------------------------------------------------

        if (node instanceof BinaryExpr binaryExpr) {

            if (binaryExpr.getOperator()
                    == BinaryExpr.Operator.AND
                    ||
                    binaryExpr.getOperator()
                            == BinaryExpr.Operator.OR) {

                complexity[0]++;
            }
        }


        // ---------------------------------------------------------
        // Continue AST traversal
        // ---------------------------------------------------------

        for (Node child :
                node.getChildNodes()) {

            calculateCognitiveNode(
                    child,
                    nestingLevel,
                    complexity
            );
        }
    }


    // =============================================================
    // MAXIMUM NESTING DEPTH
    // =============================================================

    private int calculateMaximumNestingDepth(
            MethodDeclaration method) {

        return calculateNestingDepth(
                method,
                0
        );
    }


    private int calculateNestingDepth(
            Node node,
            int currentDepth) {

        int depth =
                currentDepth;


        boolean nestingStructure =
                node instanceof IfStmt
                        || node instanceof ForStmt
                        || node instanceof ForEachStmt
                        || node instanceof WhileStmt
                        || node instanceof DoStmt
                        || node instanceof SwitchStmt
                        || node instanceof TryStmt;


        int nextDepth =
                currentDepth;


        if (nestingStructure) {

            nextDepth++;

            depth =
                    Math.max(
                            depth,
                            nextDepth
                    );
        }


        for (Node child :
                node.getChildNodes()) {

            depth =
                    Math.max(
                            depth,
                            calculateNestingDepth(
                                    child,
                                    nextDepth
                            )
                    );
        }


        return depth;
    }


    // =============================================================
    // CODE SMELLS
    // =============================================================

    private void detectMethodSmells(
            MethodDeclaration method,
            int cyclomatic,
            int cognitive,
            int nestingDepth,
            List<String> codeSmells) {


        String methodName =
                method.getNameAsString();


        // ---------------------------------------------------------
        // High Cyclomatic Complexity
        // ---------------------------------------------------------

        if (cyclomatic > 10) {

            codeSmells.add(
                    "High Cyclomatic Complexity: "
                            + methodName
            );
        }


        // ---------------------------------------------------------
        // High Cognitive Complexity
        // ---------------------------------------------------------

        if (cognitive > 15) {

            codeSmells.add(
                    "High Cognitive Complexity: "
                            + methodName
            );
        }


        // ---------------------------------------------------------
        // Long Method
        // ---------------------------------------------------------

        if (method.getRange().isPresent()) {

            int lines =
                    method.getRange().get().end.line
                            - method.getRange().get().begin.line
                            + 1;


            if (lines > 50) {

                codeSmells.add(
                        "Long Method: "
                                + methodName
                );
            }
        }


        // ---------------------------------------------------------
        // Too Many Parameters
        // ---------------------------------------------------------

        if (method.getParameters().size() > 5) {

            codeSmells.add(
                    "Too Many Parameters: "
                            + methodName
            );
        }


        // ---------------------------------------------------------
        // Deep Nesting
        // ---------------------------------------------------------

        if (nestingDepth > 4) {

            codeSmells.add(
                    "Deep Nesting: "
                            + methodName
            );
        }


        // ---------------------------------------------------------
        // Empty Catch Block
        // ---------------------------------------------------------

        for (CatchClause catchClause :
                method.findAll(
                        CatchClause.class
                )) {

            if (catchClause.getBody()
                    .getStatements()
                    .isEmpty()) {

                codeSmells.add(
                        "Empty Catch Block: "
                                + methodName
                );

                break;
            }
        }
    }


    // =============================================================
    // RISK LEVEL
    // =============================================================

    private String calculateRiskLevel(
            int highestComplexity,
            int maximumNestingDepth,
            int longestMethodLines,
            List<String> codeSmells) {


        // ---------------------------------------------------------
        // CRITICAL
        // ---------------------------------------------------------

        if (highestComplexity > 15
                || maximumNestingDepth > 6) {

            return "CRITICAL";
        }


        // ---------------------------------------------------------
        // HIGH
        // ---------------------------------------------------------

        if (highestComplexity > 10
                || maximumNestingDepth > 4
                || longestMethodLines > 50
                || codeSmells.size() >= 3) {

            return "HIGH";
        }


        // ---------------------------------------------------------
        // MEDIUM
        // ---------------------------------------------------------

        if (highestComplexity > 5
                || maximumNestingDepth > 2
                || !codeSmells.isEmpty()) {

            return "MEDIUM";
        }


        // ---------------------------------------------------------
        // LOW
        // ---------------------------------------------------------

        return "LOW";
    }
}