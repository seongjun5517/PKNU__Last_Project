package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.UserResponse;
import com.Skin_Predict_Platform.project.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getUserList().stream()
                .map(UserResponse::from)
                .toList();
    }
}
