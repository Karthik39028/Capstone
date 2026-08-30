package com.example.demo.controller;

import com.example.demo.dto.AnalysisRequest;
import com.example.demo.service.ASTAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ast")
public class ASTController {

    @Autowired
    private ASTAnalysisService astService;

    @PostMapping("/analyze")
    public Map<String, Object> analyzeTargetCode(@RequestBody AnalysisRequest request) {
        String language = request.getLanguage() != null ? request.getLanguage() : "Java";
        String codeSnippet = request.getCode() != null ? request.getCode() : "";

        return astService.analyzeCode(codeSnippet, language);
    }
    @Autowired
    private com.example.demo.repository.AnalysisRecordRepository recordRepository;

    @GetMapping("/history")
    public java.util.List<com.example.demo.entity.AnalysisRecord> getHistory() {
        return recordRepository.findAllByOrderByCreatedAtDesc();
    }
}