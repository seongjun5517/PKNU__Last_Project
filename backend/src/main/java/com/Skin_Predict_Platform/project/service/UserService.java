package com.Skin_Predict_Platform.project.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.model.Role;
import com.Skin_Predict_Platform.project.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Transactional = 실패시 Rollback 해줌, but, 조회시에는 readOnly붙여주는 것이 성능 개선에 도움.
    @Transactional(readOnly = true)
    public List<User> getUserList() {
        return userRepository.findAll();
    }

    @Transactional
    public User setMemberInsert(User user) {
        // 비어있으면
        if (user == null || isBlank(user.getUserId()) || isBlank(user.getUserEmail()) || isBlank(user.getUserPwd())) {
            return null;
        }
        // 중복이면
        if (userRepository.existsByUserId(user.getUserId()) || userRepository.existsByUserEmail(user.getUserEmail())) {
            return null;
        }

        user.setUserPwd(passwordEncoder.encode(user.getUserPwd()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    // ---------------- 내 정보 조회 ----------------
    @Transactional(readOnly = true)
    public User getUser(String userId) {
        if (isBlank(userId)) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }

    // ---------------- 닉네임 / 프로필 이미지 수정 ----------------
    // nickname, profileImage 는 null 이면 해당 값은 건드리지 않음 (부분 수정 지원)
    @Transactional
    public User updateUserInfo(String userId, String nickname, String profileImage) {
        if (isBlank(userId)) {
            return null;
        }

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return null;
        }

        User user = optionalUser.get();
        if (nickname != null) {
            user.setUserNickname(nickname);
        }
        if (profileImage != null) {
            user.setUserProfileImage(profileImage);
        }

        return userRepository.save(user);
    }

    // ---------------- 비밀번호 변경 ----------------
    @Transactional
    public String updatePassword(String userId, String currentPwd, String newPwd) {
        if (isBlank(userId) || isBlank(currentPwd) || isBlank(newPwd)) {
            return "필수 값이 비어있습니다.";
        }

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return "존재하지 않는 사용자입니다.";
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(currentPwd, user.getUserPwd())) {
            return "현재 비밀번호가 일치하지 않습니다.";
        }

        user.setUserPwd(passwordEncoder.encode(newPwd));
        userRepository.save(user);
        return "OK";
    }

    /**
     * Spring Security 적용 이전에 평문으로 저장된 비밀번호를 일괄 해시한다.
     * 이미 현재 BCrypt 형식으로 저장된 값은 건드리지 않는다.
     */
    @Transactional
    public int migrateLegacyPasswords() {
        int migratedCount = 0;

        for (User user : userRepository.findAll()) {
            String storedPassword = user.getUserPwd();
            if (isBlank(storedPassword) || isEncodedPassword(storedPassword)) {
                continue;
            }

            user.setUserPwd(passwordEncoder.encode(storedPassword));
            migratedCount++;
        }

        return migratedCount;
    }

    @Transactional
    private String setMemberDelete(String userId) {
        if (isBlank(userId)) {
            return "사용자 아이디는 필수입니다.";
        }

        if (!userRepository.existsById(userId)) {
            return "존재하지 않는 사용자입니다.";
        }

        userRepository.deleteById(userId);
        return "사용자가 삭제되었습니다.";
    }

    // 값이 비어있는지 체크 메서드(공백제거)
    @Transactional
    public boolean deleteUser(String userId) {
        if (isBlank(userId) || !userRepository.existsById(userId)) {
            return false;
        }
        userRepository.deleteById(userId);
        return true;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isEncodedPassword(String value) {
        return value.startsWith("{bcrypt}");
    }
}
