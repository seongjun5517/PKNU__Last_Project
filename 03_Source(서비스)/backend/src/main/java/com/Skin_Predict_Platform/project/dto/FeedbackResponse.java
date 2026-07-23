package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FeedbackResponse {
    private Long fbCode;
    private String fbUserId;
    private String userNickname;
    private String fbType;
    private String fbEvaluate;
    private String fbComment;
    private LocalDateTime fbCreatedAt;
}
