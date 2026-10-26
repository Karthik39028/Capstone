package com.example.demo.controller;

import com.example.demo.service.AstAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalysisController {

    @Autowired
    private AstAnalysisService astAnalysisService;

    @PostMapping(
            value = "/scan",
            consumes = "application/json",
            produces = "application/json"
    )
    public ResponseEntity<Map<String, Object>> scanRepository(
            @RequestBody Map<String, String> request) {

        System.out.println("=================================");
        System.out.println("ANALYSIS REQUEST RECEIVED");
        System.out.println("Request: " + request);
        System.out.println("=================================");

        String githubUrl = request.get("repoUrl");

        if (githubUrl == null || githubUrl.trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "status", "error",
                            "message", "repoUrl is required"
                    )
            );
        }

        try {

            Map<String, Object> result =
                    astAnalysisService.analyzeGitHubRepo(
                            githubUrl.trim()
                    );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    )
            );
        }
    }
}