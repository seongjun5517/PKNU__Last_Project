package com.Skin_Predict_Platform.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackCreateRequest {
    private String userId;
    private String feedbackType;
    private String evaluation;
    private String comment;
}
