package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.SkinTypeResultSaveRequest;
import com.Skin_Predict_Platform.project.model.SkinTypeResult;
import com.Skin_Predict_Platform.project.service.SkinTypeResultService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/skin-type")
@RequiredArgsConstructor
public class SkinTypeResultController {

    private final SkinTypeResultService skinTypeResultService;

    @PostMapping("/results")
    public ResponseEntity<?> saveResults(
            Authentication authentication,
            @RequestBody SkinTypeResultSaveRequest request) {
        List<SkinTypeResult> savedResults =
                skinTypeResultService.saveResults(authentication.getName(), request);
        if (savedResults.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("피부 타입 진단 결과가 올바르지 않습니다.");
        }
        return ResponseEntity.ok(savedResults);
    }

    @GetMapping("/results/latest")
    public List<SkinTypeResult> getLatestResults(Authentication authentication) {
        return skinTypeResultService.getLatestResults(authentication.getName());
    }

    @GetMapping("/results/today")
    public List<SkinTypeResult> getTodayResults(Authentication authentication) {
        return skinTypeResultService.getTodayResults(authentication.getName());
    }

    @GetMapping("/results/history")
    public List<SkinTypeResult> getHistoryResults(Authentication authentication) {
        return skinTypeResultService.getAllResults(authentication.getName());
    }

    @DeleteMapping("/results/today")
    public ResponseEntity<Long> deleteTodayResults(Authentication authentication) {
        return ResponseEntity.ok(skinTypeResultService.deleteTodayResults(authentication.getName()));
    }

    @DeleteMapping("/results/latest")
    public ResponseEntity<Long> deleteLatestResults(Authentication authentication) {
        return ResponseEntity.ok(skinTypeResultService.deleteLatestResults(authentication.getName()));
    }
}
