package com.Skin_Predict_Platform.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.CommunityPostLike;

public interface CommunityPostLikeRepository extends JpaRepository<CommunityPostLike, Long> {
    Optional<CommunityPostLike> findByLikePostCodeAndLikeUserId(Long likePostCode, String likeUserId);

    boolean existsByLikePostCodeAndLikeUserId(Long likePostCode, String likeUserId);
    List<CommunityPostLike> findByLikeUserId(String likeUserId);
}
