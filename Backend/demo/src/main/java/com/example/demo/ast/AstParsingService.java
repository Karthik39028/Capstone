package com.example.demo.ast;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.ConditionalExpr;
import com.github.javaparser.ast.stmt.*;
import org.springframework.stereotype.Service;

@Service
public class AstParsingService {

    /**
     * Parses raw Java code and calculates its Cyclomatic Complexity.
     * Formula: Base of 1 + every decision point (if, for, while, case, catch, etc.)
     */
    public int calculateCyclomaticComplexity(String javaCode) {

        // 1. Convert the raw text into a mathematical Abstract Syntax Tree
        CompilationUnit cu = StaticJavaParser.parse(javaCode);

        // 2. Base complexity always starts at 1
        int[] complexity = {1};

        // 3. Walk through the AST and count every decision branch
        cu.findAll(IfStmt.class).forEach(n -> complexity[0]++);
        cu.findAll(ForStmt.class).forEach(n -> complexity[0]++);
        cu.findAll(WhileStmt.class).forEach(n -> complexity[0]++);
        cu.findAll(DoStmt.class).forEach(n -> complexity[0]++);
        cu.findAll(CatchClause.class).forEach(n -> complexity[0]++);
        cu.findAll(ConditionalExpr.class).forEach(n -> complexity[0]++); // Ternary operator ( ? : )

        // Switch statements are special: we count 'case' but ignore 'default'
        cu.findAll(SwitchEntry.class).forEach(entry -> {
            if (entry.getLabels().isNonEmpty()) {
                complexity[0]++;
            }
        });

        // 4. Return the final mathematical score
        return complexity[0];
    }
}