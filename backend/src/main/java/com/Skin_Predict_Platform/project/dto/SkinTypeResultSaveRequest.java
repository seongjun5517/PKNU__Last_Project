package com.Skin_Predict_Platform.project.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SkinTypeResultSaveRequest {
    @JsonAlias({"user_id", "stypeUserId", "stype_user_id"})
    private String userId;

    private List<SkinTypeResultItem> results;
}
