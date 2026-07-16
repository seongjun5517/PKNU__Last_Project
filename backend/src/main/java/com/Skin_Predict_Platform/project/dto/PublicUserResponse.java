package com.Skin_Predict_Platform.project.dto;

import com.Skin_Predict_Platform.project.model.User;

public record PublicUserResponse(
        String userId,
        String userNickname,
        String userProfileImage) {

    public static PublicUserResponse from(User user) {
        return new PublicUserResponse(
                user.getUserId(),
                user.getUserNickname(),
                user.getUserProfileImage());
    }
}
