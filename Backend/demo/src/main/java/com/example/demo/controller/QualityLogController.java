package com.example.demo.controller; // Update this if your package name is different

import com.example.demo.model.QualityLog;
import com.example.demo.repository.QualityLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:5173") // This allows your React app to talk to Spring Boot!
public class QualityLogController {

    private final QualityLogRepository repository;

    public QualityLogController(QualityLogRepository repository) {
        this.repository = repository;
    }

    // React will call this to get the logs for the dashboard
    @GetMapping
    public List<QualityLog> getRecentLogs() {
        return repository.findTop10ByOrderByTimestampDesc();
    }

    // A temporary endpoint so we can generate fake data to test the connection
    @PostMapping("/test-generate")
    public QualityLog generateTestLog() {
        QualityLog log = new QualityLog();
        log.setRepositoryUrl("github.com/b-sai-krishna/BeatFlow");
        log.setTargetFile("SecurityConfig.java");
        log.setActionType("AST_PARSED");
        log.setStatus("SUCCESS");
        log.setDetails("Simulated AST parsing and AI test generation successful.");

        return repository.save(log);
    }
}