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
        name = "community_post_like",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_community_post_like_user_post",
                        columnNames = {"like_user_id", "like_post_code"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityPostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_code")
    private Long likeCode;

    @Column(name = "like_post_code", nullable = false)
    private Long likePostCode;

    @Column(name = "like_user_id", nullable = false, length = 255)
    private String likeUserId;

    @Column(name = "like_created_at")
    private LocalDateTime likeCreatedAt;

    @PrePersist
    void prePersist() {
        if (likeCreatedAt == null) {
            likeCreatedAt = LocalDateTime.now();
        }
    }
}
