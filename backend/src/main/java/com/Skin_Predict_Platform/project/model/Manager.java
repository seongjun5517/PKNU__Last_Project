package com.Skin_Predict_Platform.project.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manager")
@Getter
@NoArgsConstructor
public class Manager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "man_code")
    private Long manCode;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "man_auth", length = 255)
    private String manAuth;
}
