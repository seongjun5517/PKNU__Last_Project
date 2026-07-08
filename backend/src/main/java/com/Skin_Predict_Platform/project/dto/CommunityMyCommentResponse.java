package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommunityMyCommentResponse {
    private Long cmtCode;
    private Long postCode;
    private String postTitle;
    private String contents;
    private LocalDateTime createdAt;
}
