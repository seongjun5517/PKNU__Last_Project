package com.Skin_Predict_Platform.project.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SkinTypeResultItem {
    @JsonAlias("stype_face")
    private String stypeFace;

    @JsonAlias("stype_name")
    private String stypeName;

    @JsonAlias("stype_fig")
    private Integer stypeFig;
}
