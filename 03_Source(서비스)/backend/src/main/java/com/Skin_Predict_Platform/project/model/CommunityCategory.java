package com.Skin_Predict_Platform.project.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "`Community_Category`")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityCategory {

    @Id
    @Column(name = "category_code", nullable = false)
    private Long categoryCode;

    @Column(name = "category_name", nullable = false, length = 255)
    private String categoryName;
}
