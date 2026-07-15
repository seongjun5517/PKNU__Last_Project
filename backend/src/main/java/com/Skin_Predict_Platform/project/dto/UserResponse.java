package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.Skin_Predict_Platform.project.model.Role;
import com.Skin_Predict_Platform.project.model.User;

public record UserResponse(
        String userId,
        String userEmail,
        String userNickname,
        String userProfileImage,
        LocalDateTime userCreatedAt,
        LocalDate userBirthday,
        Role role,
        String manAuth) {

    public static UserResponse from(User user) {
        return new UserResponse(
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
