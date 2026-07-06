package com.Skin_Predict_Platform.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.Calendar;



public interface CalRepository extends JpaRepository<Calendar, String> {
    
}
