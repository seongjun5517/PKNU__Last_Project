package com.Skin_Predict_Platform.project.controller;

import java.util.List;

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
    public ResponseEntity<?> saveResults(@RequestBody SkinTypeResultSaveRequest request) {
        List<SkinTypeResult> savedResults = skinTypeResultService.saveResults(request);

        if (savedResults.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("피부 타입 진단 결과 저장 데이터가 올바르지 않습니다.");
        }

        return ResponseEntity.ok(savedResults);
    }

    @GetMapping("/results/latest/{userId}")
    public ResponseEntity<List<SkinTypeResult>> getLatestResults(@PathVariable String userId) {
        return ResponseEntity.ok(skinTypeResultService.getLatestResults(userId));
    }

    @GetMapping("/results/today/{userId}")
    public ResponseEntity<List<SkinTypeResult>> getTodayResults(@PathVariable String userId) {
        return ResponseEntity.ok(skinTypeResultService.getTodayResults(userId));
    }

    @DeleteMapping("/results/today/{userId}")
    public ResponseEntity<Long> deleteTodayResults(@PathVariable String userId) {
        return ResponseEntity.ok(skinTypeResultService.deleteTodayResults(userId));
    }

    @DeleteMapping("/results/latest/{userId}")
    public ResponseEntity<Long> deleteLatestResults(@PathVariable String userId) {
        return ResponseEntity.ok(skinTypeResultService.deleteLatestResults(userId));
    }


    // 마이페이지 그래프 관련 함수
    @GetMapping("/results/history/{userId}")
    public ResponseEntity<List<SkinTypeResult>> getHistoryResults(@PathVariable String userId) {
        return ResponseEntity.ok(skinTypeResultService.getAllResults(userId));
    }
}
