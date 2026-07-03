package com.Skin_Predict_Platform.project.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User saveSampleUser() {

        User user = User.builder()
                .userId("sooping")
                .userEmail("ussophia3@naver.com")
                .userPwd("triple-skin")
                .userNickname("수핑")
                .userProfileImage(null)
                .userBirthday(LocalDate.of(2001, 3, 7))
                .userMan(false)
                .build();

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
}
