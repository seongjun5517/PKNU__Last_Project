package com.Skin_Predict_Platform.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fb_code")
    private Long fbCode;

    @Column(name = "fb_user_id", nullable = false)
    private String fbUserId;

    @Column(name = "fb_type", nullable = false, length = 30)
    private String fbType;

    @Column(name = "fb_evaluate", nullable = false, length = 30)
    private String fbEvaluate;

    @Column(name = "fb_comment", columnDefinition = "TEXT")
    private String fbComment;

    @Column(name = "fb_created_at")
    private LocalDateTime fbCreatedAt;
}
