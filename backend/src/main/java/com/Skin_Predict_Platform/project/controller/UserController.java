package com.Skin_Predict_Platform.project.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // 프로필 이미지가 저장될 실제 디스크 경로 (application.properties 에서 오버라이드 가능)
    @Value("${app.upload.profile-image-dir:../../../database/my_img}")
    private String uploadDir;

    // DB / 프론트에 내려줄 URL 접두사 (StaticResourceConfig 의 매핑과 반드시 일치해야 함)
    private static final String IMAGE_URL_PREFIX = "/images/profile/";

    @GetMapping(path = "/check")
    public String checkLink() {
        return "user link ok";
    }

    @GetMapping(path = "/list")
    public ResponseEntity<List<User>> getUserList() {
        log.info("getUserList() called");
        return ResponseEntity.ok(userService.getUserList());
    }

    // ---------------- 내 정보 조회 ----------------
    // 응답은 User 엔티티가 그대로 직렬화되므로 필드명이 camelCase 로 내려감 (userId, userNickname, userProfileImage ...)
    @GetMapping(path = "/{user_id}")
    public ResponseEntity<?> getUser(@PathVariable("user_id") String userId) {
        log.info("getUser() called, user_id={}", userId);

        User user = userService.getUser(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 사용자입니다.");
        }

        user.setUserPwd(null);
        return ResponseEntity.ok(user);
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

    // ---------------- 닉네임 / 프로필 이미지 경로 수정 ----------------
    // 요청 body는 기존 insert/login 과 동일하게 snake_case Map 으로 받음
    // user_profile_image 는 보통 /profile-image 업로드 응답으로 받은 경로를 그대로 넣어서 호출함
    @PutMapping(path = "/update")
    public ResponseEntity<?> updateUserInfo(@RequestBody Map<String, Object> requestBody) {
        String userId = getString(requestBody, "user_id");
        String nickname = getString(requestBody, "user_nickname");
        String profileImage = getString(requestBody, "user_profile_image");

        log.info("user update request, user_id={}", userId);

        User updated = userService.updateUserInfo(userId, nickname, profileImage);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 사용자입니다.");
        }

        updated.setUserPwd(null);
        return ResponseEntity.ok(updated);
    }

    // ---------------- 비밀번호 변경 ----------------
    @PutMapping(path = "/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, Object> requestBody) {
        String userId = getString(requestBody, "user_id");
        String currentPwd = getString(requestBody, "current_pwd");
        String newPwd = getString(requestBody, "new_pwd");

        log.info("user password update request, user_id={}", userId);

        String result = userService.updatePassword(userId, currentPwd, newPwd);
        if (!"OK".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }

        return ResponseEntity.ok("비밀번호가 변경되었습니다.");
    }

    // ---------------- 프로필 이미지 업로드 ----------------
    // multipart/form-data 로 받음: user_id (텍스트), image (파일)
    @PostMapping(path = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("user_id") String userId,
            @RequestParam("image") MultipartFile image) {

        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body("이미지 파일이 비어있습니다.");
        }

        try {
            String savedImagePath = saveProfileImageFile(userId, image);

            User updated = userService.updateUserInfo(userId, null, savedImagePath);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("존재하지 않는 사용자입니다.");
            }

            // 프론트에서 바로 <img src={...}> 로 쓸 수 있도록 저장된 경로를 함께 반환
            return ResponseEntity.ok(Map.of("user_profile_image", savedImagePath));
        } catch (IOException e) {
            log.error("프로필 이미지 저장 실패, user_id={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이미지 저장 중 오류가 발생했습니다.");
        }
    }

    private String saveProfileImageFile(String userId, MultipartFile image) throws IOException {
        String original = image.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        // 파일명 충돌 방지: user_id + timestamp
        String filename = userId + "_" + System.currentTimeMillis() + ext;

        Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dirPath);

        Path filePath = dirPath.resolve(filename);
        image.transferTo(filePath.toFile());

        log.info("profile image saved: {}", filePath);

        // DB / 프론트에는 실제 디스크 경로가 아니라 브라우저가 접근 가능한 URL 경로를 저장
        return IMAGE_URL_PREFIX + filename;
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