package com.Skin_Predict_Platform.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommunityCommentCreateRequest {
    private String userId;
    private String contents;
}
