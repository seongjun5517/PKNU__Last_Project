package com.Skin_Predict_Platform.project.repository;

import com.Skin_Predict_Platform.project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}
