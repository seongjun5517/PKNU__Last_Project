package com.Skin_Predict_Platform.project.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "user_id", length = 255)
    private String userId;

    @Column(name = "user_email", nullable = false, unique = true, length = 255)
    private String userEmail;

    @Column(name = "user_pwd", nullable = false, length = 255)
    private String userPwd;

    @Column(name = "user_nickname", length = 100)
    private String userNickname;

    @Column(name = "user_profile_image", length = 500)
    private String userProfileImage;

    @Column(name = "user_created_at")
    private LocalDateTime userCreatedAt;

    @Column(name = "user_birthday")
    private LocalDate userBirthday;

    @Column(name = "user_man")
    private Boolean userMan;

    // 비어있는 데이터 값 기본 값 지정.
    @PrePersist
    void prePersist() {
        if (userCreatedAt == null) {
            userCreatedAt = LocalDateTime.now();
        }
        if (userMan == null) {
            userMan = false;
        }
    }
}
