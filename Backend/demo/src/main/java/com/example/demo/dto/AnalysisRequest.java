package com.example.demo.dto;

public class AnalysisRequest {
    private String language;
    private String code;

    public AnalysisRequest() {}

    public AnalysisRequest(String language, String code) {
        this.language = language;
        this.code = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}