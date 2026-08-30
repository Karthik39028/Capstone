package com.example.demo.service;

import com.example.demo.entity.AnalysisRecord;
import com.example.demo.repository.AnalysisRecordRepository;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.stmt.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ASTAnalysisService {

    @Autowired
    private AiService aiService; // Matches your active service bean

    @Autowired
    private AnalysisRecordRepository repository;

    public Map<String, Object> analyzeCode(String rawCode, String language) {
        Map<String, Object> result = new HashMap<>();
        String prompt = "";
        String complexityString = "";
        List<String> smells = new ArrayList<>();

        if (language.equalsIgnoreCase("Java")) {
            int exactAstScore = 1;
            try {
                CompilationUnit cu = StaticJavaParser.parse(rawCode);

                exactAstScore += cu.findAll(IfStmt.class).size();
                exactAstScore += cu.findAll(ForStmt.class).size();
                exactAstScore += cu.findAll(WhileStmt.class).size();
                exactAstScore += cu.findAll(SwitchStmt.class).size();
                complexityString = String.valueOf(exactAstScore);

                if (exactAstScore > 10) {
                    smells.add("High Cyclomatic Complexity (>10)");
                }

                long emptyCatches = cu.findAll(CatchClause.class).stream()
                        .filter(c -> c.getBody().isEmpty())
                        .count();
                if (emptyCatches > 0) {
                    smells.add(emptyCatches + " Empty Catch Block(s) detected");
                }

                long bloatedMethods = cu.findAll(MethodDeclaration.class).stream()
                        .filter(m -> m.getParameters().size() > 4)
                        .count();
                if (bloatedMethods > 0) {
                    smells.add(bloatedMethods + " Method(s) with excessive parameters (>4)");
                }

                if (smells.isEmpty()) {
                    smells.add("Clean Code: No smells detected.");
                }

                // --- ENFORCED DUAL-PART PROMPT FOR JAVA ---
                prompt = "You are an expert enterprise code reviewer and Java unit test generator.\n" +
                        "I have parsed this code into an AST and calculated a Cyclomatic Complexity of " + exactAstScore + ".\n\n" +
                        "Please provide your response in two clear sections:\n" +
                        "1. AI EVALUATION NOTES: A detailed architectural breakdown of the code quality, execution paths, and structural findings.\n" +
                        "2. TEST SUITE: Complete, production-ready JUnit 5 test cases wrapped strictly inside a ```java ... ``` code block.\n\n" +
                        "Target Code:\n" + rawCode;
            } catch (Exception e) {
                complexityString = "Error parsing Java";
                smells.add("Could not parse AST for smells.");
                prompt = "Analyze this Java code, provide evaluation notes, and write complete JUnit 5 tests inside a ```java ... ``` code block:\n" + rawCode;
            }
        } else {
            // --- INTELLIGENT AI FALLBACK ROUTING ---
            complexityString = "AI Estimated";
            smells.add("AST Smell Detection is isolated to Java. AI Fallback used for " + language + ".");

            String testFramework = "the standard testing framework";
            switch (language.toLowerCase()) {
                case "python": testFramework = "PyTest"; break;
                case "javascript":
                case "typescript": testFramework = "Jest"; break;
                case "c++": testFramework = "GoogleTest (gtest)"; break;
                case "c#": testFramework = "xUnit and Moq"; break;
                case "go": testFramework = "the built-in 'testing' package"; break;
                case "rust": testFramework = "the built-in #[test] macros"; break;
                case "php": testFramework = "PHPUnit"; break;
                case "ruby": testFramework = "RSpec"; break;
                case "kotlin": testFramework = "JUnit 5 and MockK"; break;
                case "swift": testFramework = "XCTest"; break;
            }

            // --- ENFORCED DUAL-PART PROMPT FOR OTHER LANGUAGES ---
            prompt = "You are an expert code analyzer and QA engineer. Analyze this " + language + " code using " + testFramework + ".\n\n" +
                    "Please provide your response in two clear sections:\n" +
                    "1. AI EVALUATION NOTES: A thorough breakdown of the code architecture, logic flow, and optimization recommendations.\n" +
                    "2. TEST SUITE: Complete, production-ready unit tests wrapped strictly inside a ```" + language.toLowerCase() + " ... ``` code block.\n\n" +
                    "Target Code:\n" + rawCode;
        }

        String generatedTests = aiService.generateTests(prompt);

        AnalysisRecord record = new AnalysisRecord();
        record.setLanguage(language);
        record.setSourceCode(rawCode);
        record.setComplexityScore(complexityString);
        record.setTestCases(generatedTests);
        record.setCodeSmells(String.join(", ", smells));
        repository.save(record);

        result.put("status", "success");
        result.put("languageDetected", language);
        result.put("complexityScore", complexityString);
        result.put("codeSmells", smells);
        result.put("testCases", generatedTests);

        return result;
    }
}