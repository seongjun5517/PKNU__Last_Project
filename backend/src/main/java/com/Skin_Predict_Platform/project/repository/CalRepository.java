package com.Skin_Predict_Platform.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Skin_Predict_Platform.project.model.Calendar;


@Repository
public interface CalRepository extends JpaRepository<Calendar, String> {
    
}
