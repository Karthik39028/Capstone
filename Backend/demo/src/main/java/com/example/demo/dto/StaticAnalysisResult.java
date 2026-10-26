package com.example.demo.dto;

import java.util.ArrayList;
import java.util.List;

public class StaticAnalysisResult {

    private String fileName;
    private String filePath;

    private int linesOfCode;
    private int classCount;
    private int methodCount;
    private int parameterCount;
    private int variableCount;

    private int cyclomaticComplexity;
    private int cognitiveComplexity;

    private int maximumNestingDepth;
    private int longestMethodLines;

    private String highestRiskMethod;
    private int highestRiskMethodComplexity;

    private String riskLevel;

    private List<String> codeSmells = new ArrayList<>();


    // Default constructor
    public StaticAnalysisResult() {
    }


    // Getters and Setters

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }


    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }


    public int getLinesOfCode() {
        return linesOfCode;
    }

    public void setLinesOfCode(int linesOfCode) {
        this.linesOfCode = linesOfCode;
    }


    public int getClassCount() {
        return classCount;
    }

    public void setClassCount(int classCount) {
        this.classCount = classCount;
    }


    public int getMethodCount() {
        return methodCount;
    }

    public void setMethodCount(int methodCount) {
        this.methodCount = methodCount;
    }


    public int getParameterCount() {
        return parameterCount;
    }

    public void setParameterCount(int parameterCount) {
        this.parameterCount = parameterCount;
    }


    public int getVariableCount() {
        return variableCount;
    }

    public void setVariableCount(int variableCount) {
        this.variableCount = variableCount;
    }


    public int getCyclomaticComplexity() {
        return cyclomaticComplexity;
    }

    public void setCyclomaticComplexity(int cyclomaticComplexity) {
        this.cyclomaticComplexity = cyclomaticComplexity;
    }


    public int getCognitiveComplexity() {
        return cognitiveComplexity;
    }

    public void setCognitiveComplexity(int cognitiveComplexity) {
        this.cognitiveComplexity = cognitiveComplexity;
    }


    public int getMaximumNestingDepth() {
        return maximumNestingDepth;
    }

    public void setMaximumNestingDepth(int maximumNestingDepth) {
        this.maximumNestingDepth = maximumNestingDepth;
    }


    public int getLongestMethodLines() {
        return longestMethodLines;
    }

    public void setLongestMethodLines(int longestMethodLines) {
        this.longestMethodLines = longestMethodLines;
    }


    public String getHighestRiskMethod() {
        return highestRiskMethod;
    }

    public void setHighestRiskMethod(String highestRiskMethod) {
        this.highestRiskMethod = highestRiskMethod;
    }


    public int getHighestRiskMethodComplexity() {
        return highestRiskMethodComplexity;
    }

    public void setHighestRiskMethodComplexity(int highestRiskMethodComplexity) {
        this.highestRiskMethodComplexity = highestRiskMethodComplexity;
    }


    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }


    public List<String> getCodeSmells() {
        return codeSmells;
    }

    public void setCodeSmells(List<String> codeSmells) {
        this.codeSmells = codeSmells;
    }
}