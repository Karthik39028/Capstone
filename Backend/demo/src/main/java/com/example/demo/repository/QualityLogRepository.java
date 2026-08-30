package com.example.demo.repository;

import com.example.demo.model.QualityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityLogRepository extends JpaRepository<QualityLog, Long> {
    List<QualityLog> findTop10ByOrderByTimestampDesc();
}