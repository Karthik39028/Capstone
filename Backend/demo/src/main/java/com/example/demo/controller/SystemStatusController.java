package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class SystemStatusController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getSystemStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "Automated Quality Monitor API");
        return ResponseEntity.ok(status);
    }
}