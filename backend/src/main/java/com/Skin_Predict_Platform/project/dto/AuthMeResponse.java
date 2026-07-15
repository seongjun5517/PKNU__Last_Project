package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.model.Role;

public record AuthMeResponse(
        String userId,
        String userEmail,
        String userNickname,
        String userProfileImage,
        LocalDateTime userCreatedAt,
        LocalDate userBirthday,
        Role role,
        String manAuth) {

    public static AuthMeResponse from(User user) {
        return new AuthMeResponse(
                user.getUserId(),
                user.getUserEmail(),
                user.getUserNickname(),
                user.getUserProfileImage(),
                user.getUserCreatedAt(),
                user.getUserBirthday(),
                user.getRole(),
                user.getManAuth());
    }
}
