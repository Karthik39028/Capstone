package com.example.demo.repository;

import com.example.demo.entity.AnalysisRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRecordRepository extends JpaRepository<AnalysisRecord, Long> {
    // Custom method to fetch history from newest to oldest
    List<AnalysisRecord> findAllByOrderByCreatedAtDesc();
}