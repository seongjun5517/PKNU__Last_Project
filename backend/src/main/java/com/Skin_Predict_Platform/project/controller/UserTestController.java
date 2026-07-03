package com.Skin_Predict_Platform.project.controller;

import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test/users")
public class UserTestController {

    private final UserService userService;

    public UserTestController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User saveSampleUser() {
        return userService.saveSampleUser();
    }

    @GetMapping
    public List<User> findAllUsers() {
        return userService.findAllUsers();
    }
}
