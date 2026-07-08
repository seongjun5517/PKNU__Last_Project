package com.Skin_Predict_Platform.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.SkinTypeResult;

public interface SkinTypeResultRepository extends JpaRepository<SkinTypeResult, Long> {
    List<SkinTypeResult> findByStypeUserIdOrderByStypeDateDescStypeCodeAsc(String stypeUserId);

    List<SkinTypeResult> findByStypeUserIdAndStypeDateGreaterThanEqualAndStypeDateLessThanOrderByStypeDateDescStypeCodeAsc(
            String stypeUserId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    long deleteByStypeUserIdAndStypeDateGreaterThanEqualAndStypeDateLessThan(
            String stypeUserId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}
