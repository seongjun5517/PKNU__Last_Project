package com.Skin_Predict_Platform.project.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SkinTypeResultSaveRequest {
    private String userId;

    private List<SkinTypeResultItem> results;
}
