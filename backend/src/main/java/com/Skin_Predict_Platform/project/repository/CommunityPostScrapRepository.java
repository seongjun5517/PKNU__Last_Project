package com.Skin_Predict_Platform.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.CommunityPostScrap;

public interface CommunityPostScrapRepository extends JpaRepository<CommunityPostScrap, Long> {
    Optional<CommunityPostScrap> findByScrapPostCodeAndScrapUserId(Long scrapPostCode, String scrapUserId);

    boolean existsByScrapPostCodeAndScrapUserId(Long scrapPostCode, String scrapUserId);
}
