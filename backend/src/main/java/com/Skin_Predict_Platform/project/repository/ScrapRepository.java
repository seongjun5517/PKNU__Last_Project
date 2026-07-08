package com.Skin_Predict_Platform.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.Scrap;

public interface ScrapRepository extends JpaRepository<Scrap, Long> {
    Optional<Scrap> findByScrapPostCodeAndScrapUserId(Long scrapPostCode, String scrapUserId);

    boolean existsByScrapPostCodeAndScrapUserId(Long scrapPostCode, String scrapUserId);

    List<Scrap> findByScrapUserId(String scrapUserId);
}