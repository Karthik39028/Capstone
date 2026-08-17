package com.example.demo.controller;

import com.example.demo.ast.AstParsingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ast")
@CrossOrigin(origins = "*") // Allows your React frontend to communicate with this backend later
public class AstController {

    private final AstParsingService astParsingService;

    @Autowired
    public AstController(AstParsingService astParsingService) {
        this.astParsingService = astParsingService;
    }

    /**
     * Endpoint to receive raw Java code and return its Cyclomatic Complexity.
     */
    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeCode(@RequestBody String javaCode) {
        try {
            // Pass the incoming code to your AST engine
            int complexity = astParsingService.calculateCyclomaticComplexity(javaCode);

            // Return the successful score
            return ResponseEntity.ok("AST Parsing Successful! The Cyclomatic Complexity score is: " + complexity);

        } catch (Exception e) {
            // If the user uploads invalid Java code, catch the error gracefully
            return ResponseEntity.badRequest().body("Error parsing the code. Ensure it is valid Java syntax. Details: " + e.getMessage());
        }
    }
}