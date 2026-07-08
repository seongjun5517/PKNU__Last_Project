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
        name = "Scrap",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_scrap_user_post",
                        columnNames = {"scrap_user_id", "scrap_post_code"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scrap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_code")
    private Long scrapCode;

    @Column(name = "scrap_user_id", nullable = false, length = 255)
    private String scrapUserId;

    @Column(name = "scrap_post_code", nullable = false)
    private Long scrapPostCode;

    @Column(name = "scrap_created_at")
    private LocalDateTime scrapCreatedAt;

    @PrePersist
    void prePersist() {
        if (scrapCreatedAt == null) {
            scrapCreatedAt = LocalDateTime.now();
        }
    }
}