package com.example.demo.repository;

public class RepositoryArtifact {

    private String fileName;
    private String filePath;

    private ArtifactCategory category;

    private String technology;

    private String confidence;

    private String reason;

    public RepositoryArtifact() {
    }

    public RepositoryArtifact(
            String fileName,
            String filePath,
            ArtifactCategory category,
            String technology,
            String confidence,
            String reason) {

        this.fileName = fileName;
        this.filePath = filePath;
        this.category = category;
        this.technology = technology;
        this.confidence = confidence;
        this.reason = reason;
    }

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

    public ArtifactCategory getCategory() {
        return category;
    }

    public void setCategory(ArtifactCategory category) {
        this.category = category;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}