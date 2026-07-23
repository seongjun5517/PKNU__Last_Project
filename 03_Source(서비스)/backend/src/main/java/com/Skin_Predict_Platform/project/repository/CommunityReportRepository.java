package com.Skin_Predict_Platform.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.CommunityReport;

public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {
    boolean existsByReportPostCodeAndReportUserId(Long reportPostCode, String reportUserId);

    long countByReportPostCode(Long reportPostCode);

    List<CommunityReport> findByReportPostCodeOrderByReportCreatedAtDesc(Long reportPostCode);

    void deleteByReportPostCode(Long reportPostCode);
}
