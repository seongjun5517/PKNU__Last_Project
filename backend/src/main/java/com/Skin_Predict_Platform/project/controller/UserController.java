package com.Skin_Predict_Platform.project.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @GetMapping(path = "/check")
    public String checkLink() {
        return "user link ok";
    }

    @GetMapping(path = "/list")
    public ResponseEntity<List<User>> getUserList() {
        log.info("getUserList() called");
        return ResponseEntity.ok(userService.getUserList());
    }

    @PostMapping(path = "/insert")
    public ResponseEntity<?> setMemberInsert(@RequestBody Map<String, Object> requestBody) {
        User user = toUser(requestBody);
        log.info("user insert request, user_id={}", user.getUserId());

        User savedUser = userService.setMemberInsert(user);
        if (savedUser == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("이미 사용 중인 아이디 또는 이메일입니다.");
        }

        savedUser.setUserPwd(null);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> requestBody) {
        User user = toUser(requestBody);
        log.info("user login request, user_id={}", user.getUserId());

        User loginUser = userService.login(user.getUserId(), user.getUserPwd());
        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        loginUser.setUserPwd(null);
        return ResponseEntity.ok(loginUser);
    }

    @DeleteMapping(path = "/delete/{user_id}")
    public ResponseEntity<Void> setMemberDelete(@PathVariable("user_id") String userId) {
        log.info("user delete request, user_id={}", userId);

        userService.setMemberDelete(userId);
        return ResponseEntity.noContent().build();
    }

    private User toUser(Map<String, Object> requestBody) {
        return User.builder()
                .userId(getString(requestBody, "user_id"))
                .userEmail(getString(requestBody, "user_email"))
                .userPwd(getString(requestBody, "user_pwd"))
                .userNickname(getString(requestBody, "user_nickname"))
                .userProfileImage(getString(requestBody, "user_profile_image"))
                .userBirthday(getLocalDate(requestBody, "user_birthday"))
                .userMan(getBoolean(requestBody, "user_man"))
                .build();
    }

    private String getString(Map<String, Object> requestBody, String key) {
        Object value = requestBody.get(key);
        return value == null ? null : value.toString();
    }

    private LocalDate getLocalDate(Map<String, Object> requestBody, String key) {
        String value = getString(requestBody, key);
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    private Boolean getBoolean(Map<String, Object> requestBody, String key) {
        Object value = requestBody.get(key);
        return value == null ? null : Boolean.valueOf(value.toString());
    }
}
