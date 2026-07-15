package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.FeedbackResponse;
import com.Skin_Predict_Platform.project.service.FeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminFeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public List<FeedbackResponse> getFeedback() {
        return feedbackService.getAll();
    }
}
