package com.Skin_Predict_Platform.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.Manager;

public interface ManagerRepository extends JpaRepository<Manager, Long> {
    List<Manager> findByManAuth(String manAuth);
}
