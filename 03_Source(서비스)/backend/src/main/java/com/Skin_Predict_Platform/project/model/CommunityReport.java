package com.Skin_Predict_Platform.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "community_report",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_community_report_user_post",
                        columnNames = {"report_user_id", "report_post_code"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_code")
    private Long reportCode;

    @Column(name = "report_post_code", nullable = false)
    private Long reportPostCode;

    @Column(name = "report_user_id", nullable = false, length = 255)
    private String reportUserId;

    @Column(name = "report_reason", nullable = false, length = 50)
    private String reportReason;

    @Column(name = "report_created_at")
    private LocalDateTime reportCreatedAt;

    @PrePersist
    void prePersist() {
        if (reportCreatedAt == null) {
            reportCreatedAt = LocalDateTime.now();
        }
    }
}
