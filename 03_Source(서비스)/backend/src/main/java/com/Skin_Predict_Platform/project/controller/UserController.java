package com.Skin_Predict_Platform.project.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

import com.Skin_Predict_Platform.project.dto.PasswordUpdateRequest;
import com.Skin_Predict_Platform.project.dto.PublicUserResponse;
import com.Skin_Predict_Platform.project.dto.SignUpRequest;
import com.Skin_Predict_Platform.project.dto.UserResponse;
import com.Skin_Predict_Platform.project.dto.UserUpdateRequest;
import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {

    private static final long MAX_PROFILE_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final String IMAGE_URL_PREFIX = "/images/profile/";

    private final UserService userService;

    @Value("${app.upload.profile-image-dir:../../../database/my_img}")
    private String uploadDir;

    @GetMapping("/check")
    public String checkLink() {
        return "user link ok";
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        User user = userService.getUser(authentication.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @GetMapping("/public/{userId}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String userId) {
        User user = userService.getUser(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(PublicUserResponse.from(user));
    }

    @PostMapping("/insert")
    public ResponseEntity<?> setMemberInsert(@RequestBody SignUpRequest request) {
        User user = User.builder()
                .userId(request.userId())
                .userEmail(request.userEmail())
                .userPwd(request.userPwd())
                .userNickname(request.userNickname())
                .userProfileImage(request.userProfileImage())
                .userBirthday(request.userBirthday())
                .build();

        User savedUser = userService.setMemberInsert(user);
        if (savedUser == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("이미 사용 중인 아이디 또는 이메일입니다.");
        }
        return ResponseEntity.ok(UserResponse.from(savedUser));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(
            Authentication authentication,
            @RequestBody UserUpdateRequest request) {
        User updated = userService.updateUserInfo(
                authentication.getName(),
                request.userNickname(),
                request.userProfileImage());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(
            Authentication authentication,
            @RequestBody PasswordUpdateRequest request) {
        String result = userService.updatePassword(
                authentication.getName(),
                request.currentPassword(),
                request.newPassword());
        if (!"OK".equals(result)) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(Map.of("message", "PASSWORD_UPDATED"));
    }

    @PostMapping(path = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            Authentication authentication,
            @RequestParam("image") MultipartFile image) {
        String userId = authentication.getName();

        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body("이미지 파일이 비어 있습니다.");
        }
        if (image.getSize() > MAX_PROFILE_IMAGE_SIZE_BYTES) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body("프로필 이미지는 10MB 이하만 업로드할 수 있습니다.");
        }

        try {
            String savedImagePath = saveProfileImageFile(userId, image);
            User updated = userService.updateUserInfo(userId, null, savedImagePath);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("user_profile_image", savedImagePath));
        } catch (IOException exception) {
            log.error("Failed to save profile image for userId={}", userId, exception);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이미지 저장 중 오류가 발생했습니다.");
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(
            Authentication authentication,
            HttpServletRequest servletRequest) {
        if (!userService.deleteUser(authentication.getName())) {
            return ResponseEntity.notFound().build();
        }

        HttpSession session = servletRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    private String saveProfileImageFile(String userId, MultipartFile image) throws IOException {
        String original = image.getOriginalFilename();
        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf('.'));
        }

        String safeUserId = userId.replaceAll("[^A-Za-z0-9._-]", "_");
        String filename = safeUserId + "_" + System.currentTimeMillis() + extension;
        Path directory = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(directory);

        Path filePath = directory.resolve(filename).normalize();
        if (!filePath.startsWith(directory)) {
            throw new IOException("Invalid profile image path");
        }
        image.transferTo(filePath.toFile());
        return IMAGE_URL_PREFIX + filename;
    }
}
