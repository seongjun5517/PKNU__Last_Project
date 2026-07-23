package com.Skin_Predict_Platform.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Skin_Predict_Platform.project.model.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderByFbCreatedAtDesc();

    boolean existsByFbUserIdAndFbTypeAndFbCreatedAtGreaterThanEqual(
            String fbUserId,
            String fbType,
            LocalDateTime fbCreatedAt);
}
