package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SignUpRequest(
        @JsonProperty("user_id") String userId,
        @JsonProperty("user_email") String userEmail,
        @JsonProperty("user_pwd") String userPwd,
        @JsonProperty("user_nickname") String userNickname,
        @JsonProperty("user_profile_image") String userProfileImage,
        @JsonProperty("user_birthday") LocalDate userBirthday) {
}
