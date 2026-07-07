package com.Skin_Predict_Platform.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.PostDetail;

public interface PostDetailRepository extends JpaRepository<PostDetail, Long> {
    List<PostDetail> findAllByOrderByPostCodeDesc();
}
