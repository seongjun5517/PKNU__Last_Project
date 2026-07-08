package com.Skin_Predict_Platform.project.dto;

import com.Skin_Predict_Platform.project.model.PostDetail;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommunityPostLikeResponse {
    private PostDetail post;
    private boolean liked;
}
