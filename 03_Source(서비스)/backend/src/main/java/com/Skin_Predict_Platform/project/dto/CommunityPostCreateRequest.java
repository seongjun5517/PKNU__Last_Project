package com.Skin_Predict_Platform.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommunityPostCreateRequest {
    private Long categoryCode;
    private String postTitle;
    private String postContent;
}
