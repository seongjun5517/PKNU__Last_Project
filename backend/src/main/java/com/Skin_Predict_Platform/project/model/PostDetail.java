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
@Table(name = "posts_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_code", nullable = false)
    private Long postCode;

    @Column(name = "post_user_id", nullable = false, length = 255)
    private String postUserId;

    @Column(name = "category_code", nullable = false)
    private Long categoryCode;

    @Column(name = "post_title", nullable = false, length = 255)
    private String postTitle;

    @Column(name = "post_content", columnDefinition = "TEXT")
    private String postContent;

    @Column(name = "post_views")
    private Integer postViews;

    @Column(name = "post_like")
    private Integer postLike;

    @Column(name = "post_scrap")
    private Integer postScrap;

    @Column(name = "post_date")
    private LocalDateTime postDate;

    // 디폴트값
    @PrePersist
    void prePersist() {
        if (postViews == null) {
            postViews = 0;
        }
        if (postLike == null) {
            postLike = 0;
        }
        if (postScrap == null) {
            postScrap = 0;
        }
        if (postDate == null) {
            postDate = LocalDateTime.now();
        }
    }
}
