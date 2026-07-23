package com.Skin_Predict_Platform.project.dto;

import com.Skin_Predict_Platform.project.model.PostDetail;

import lombok.AllArgsConstructor;
import lombok.Getter;
// 스크랩 버튼을 눌렀을 때
// 프론트에 “게시글 최신 정보 + 현재 스크랩 상태” 를 같이 돌려주려고 분리
@Getter
@AllArgsConstructor
public class CommunityPostScrapResponse {
    private PostDetail post;
    private boolean scrapped;
}
