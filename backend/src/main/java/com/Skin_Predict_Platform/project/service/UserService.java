package com.Skin_Predict_Platform.project.service;

import java.util.List;
import java.util.Optional;

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

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User login(String userId, String userPwd) {
        if (isBlank(userId) || isBlank(userPwd)) {
            return null;
        }

        Optional<User> user = userRepository.findByUserIdAndUserPwd(userId, userPwd);
        return user.orElse(null);
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
    // 주의: 현재 로그인 로직(findByUserIdAndUserPwd)이 평문 비교라서 여기서도 평문으로 비교/저장함.
    // 추후 BCrypt 같은 암호화를 도입하면 login()과 함께 이 메서드도 같이 바꿔야 함.
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
        if (!user.getUserPwd().equals(currentPwd)) {
            return "현재 비밀번호가 일치하지 않습니다.";
        }

        user.setUserPwd(newPwd);
        userRepository.save(user);
        return "OK";
    }

    @Transactional
    public String setMemberDelete(String userId) {
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
    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}