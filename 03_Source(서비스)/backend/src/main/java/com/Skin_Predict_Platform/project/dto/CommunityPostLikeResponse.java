package com.Skin_Predict_Platform.project.dto;

import com.Skin_Predict_Platform.project.model.PostDetail;

import lombok.AllArgsConstructor;
import lombok.Getter;
// 백엔드에서 프론트로 돌려주는 응답
// 게시글이랑 좋아요 상태 전달
@Getter
@AllArgsConstructor
public class CommunityPostLikeResponse {
    private PostDetail post;
    private boolean liked;
}
