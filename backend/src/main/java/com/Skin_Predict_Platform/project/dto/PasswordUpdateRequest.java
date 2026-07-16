package com.Skin_Predict_Platform.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PasswordUpdateRequest(
        @JsonProperty("current_pwd") String currentPassword,
        @JsonProperty("new_pwd") String newPassword) {
}
