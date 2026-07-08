package com.Skin_Predict_Platform.project.dto;

import lombok.Getter;
import lombok.Setter;

// 프론트에서 백엔드로 보내는 요청
// 누가 눌렀는지 userid 전달
@Getter
@Setter
public class CommunityPostLikeRequest {
    private String userId;
}
