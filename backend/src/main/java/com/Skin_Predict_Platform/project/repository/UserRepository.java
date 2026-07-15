package com.Skin_Predict_Platform.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Skin_Predict_Platform.project.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByUserId(String userId);

    boolean existsByUserEmail(String userEmail);

    Optional<User> findByUserId(String userId);
}
