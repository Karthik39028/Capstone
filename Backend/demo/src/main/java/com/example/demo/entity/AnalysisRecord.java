package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_history")
public class AnalysisRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    private String complexityScore;

    // --- NEW: Column for our Advanced Code Smells ---
    @Column(columnDefinition = "TEXT")
    private String codeSmells;
    // ------------------------------------------------

    @Column(columnDefinition = "LONGTEXT")
    private String testCases;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getComplexityScore() { return complexityScore; }
    public void setComplexityScore(String complexityScore) { this.complexityScore = complexityScore; }

    // NEW: Getters and Setters for codeSmells
    public String getCodeSmells() { return codeSmells; }
    public void setCodeSmells(String codeSmells) { this.codeSmells = codeSmells; }

    public String getTestCases() { return testCases; }
    public void setTestCases(String testCases) { this.testCases = testCases; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}