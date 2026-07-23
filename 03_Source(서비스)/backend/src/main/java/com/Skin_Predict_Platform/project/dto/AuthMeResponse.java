package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.Skin_Predict_Platform.project.model.Role;
import com.Skin_Predict_Platform.project.model.User;

// request response 파일은 API에서 주고받을 데이터만 따로 정의하는 DTO
// response파일은 공개해도 되는 필드만 반환
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
