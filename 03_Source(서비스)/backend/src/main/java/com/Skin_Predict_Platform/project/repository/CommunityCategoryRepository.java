package com.Skin_Predict_Platform.project.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.CommunityCategory;

public interface CommunityCategoryRepository extends JpaRepository<CommunityCategory, Long> {
}
