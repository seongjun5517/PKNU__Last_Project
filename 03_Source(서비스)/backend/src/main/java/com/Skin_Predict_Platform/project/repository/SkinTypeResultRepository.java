package com.Skin_Predict_Platform.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Skin_Predict_Platform.project.model.SkinTypeResult;

public interface SkinTypeResultRepository extends JpaRepository<SkinTypeResult, Long> {
    @Query("""
            SELECT result
            FROM SkinTypeResult result
            WHERE result.stypeUserId = :userId
            ORDER BY result.stypeDate DESC, result.stypeCode ASC
            """)
    List<SkinTypeResult> findAllByUserId(@Param("userId") String userId);

    @Query("""
            SELECT result
            FROM SkinTypeResult result
            WHERE result.stypeUserId = :userId
              AND result.stypeDate >= :startDate
              AND result.stypeDate < :endDate
            ORDER BY result.stypeDate DESC, result.stypeCode ASC
            """)
    List<SkinTypeResult> findByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Modifying
    @Query("""
            DELETE FROM SkinTypeResult result
            WHERE result.stypeUserId = :userId
              AND result.stypeDate >= :startDate
              AND result.stypeDate < :endDate
            """)
    int deleteByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
