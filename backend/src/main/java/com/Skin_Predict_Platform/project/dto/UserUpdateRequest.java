package com.Skin_Predict_Platform.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserUpdateRequest(
        @JsonProperty("user_nickname") String userNickname,
        @JsonProperty("user_profile_image") String userProfileImage) {
}
