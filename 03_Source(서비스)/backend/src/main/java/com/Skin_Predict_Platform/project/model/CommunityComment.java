package com.Skin_Predict_Platform.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cmt_code")
    private Long cmtCode;

    @Column(name = "cmt_post_code", nullable = false)
    private Long cmtPostCode;

    @Column(name = "cmt_user_id", nullable = false, length = 255)
    private String cmtUserId;

    @Column(name = "cmt_contents", nullable = false, columnDefinition = "TEXT")
    private String cmtContents;

    @Column(name = "cmt_created_at")
    private LocalDateTime cmtCreatedAt;

    @PrePersist
    void prePersist() {
        if (cmtCreatedAt == null) {
            cmtCreatedAt = LocalDateTime.now();
        }
    }
}
