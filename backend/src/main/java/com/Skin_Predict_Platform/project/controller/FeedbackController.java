package com.Skin_Predict_Platform.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.FeedbackCreateRequest;
import com.Skin_Predict_Platform.project.dto.FeedbackResponse;
import com.Skin_Predict_Platform.project.service.FeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FeedbackCreateRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.create(request));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", exception.getMessage()));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getSubmissionStatus(
            @RequestParam String userId,
            @RequestParam String feedbackType) {
        try {
            return ResponseEntity.ok(Map.of(
                    "submitted",
                    feedbackService.hasSubmittedForLatestAnalysis(userId, feedbackType)));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam String adminUserId) {
        try {
            List<FeedbackResponse> feedbackList = feedbackService.getAll(adminUserId);
            return ResponseEntity.ok(feedbackList);
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}
