package com.Skin_Predict_Platform.project.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.model.Deepmodel;
import com.Skin_Predict_Platform.project.service.DeepService;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/deep")
@RequiredArgsConstructor
public class DeepController {

    private final DeepService deepService;

    @PostMapping("/save")
    public ResponseEntity<?> save(Authentication authentication, @RequestBody SaveRequest request) {
        List<Detection> detections = request.getDetections() == null
                ? Collections.emptyList()
                : request.getDetections();
        List<String> results = detections.stream().map(Detection::getDtypeResult).toList();
        List<Integer> counts = detections.stream().map(Detection::getDtypeCnt).toList();

        boolean saved = deepService.savePrediction(
                authentication.getName(), results, counts, request.getImgPath());
        if (!saved) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "ANALYSIS_SAVE_FAILED"));
        }
        return ResponseEntity.ok(Map.of("message", "ANALYSIS_SAVED"));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayPredict(Authentication authentication) {
        DeepService.TodayPredictResult result =
                deepService.getTodayPredictDetail(authentication.getName());
        return result == null
                ? ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "TODAY_ANALYSIS_NOT_FOUND"))
                : ResponseEntity.ok(result);
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestPredict(Authentication authentication) {
        DeepService.TodayPredictResult result =
                deepService.getLatestPredictDetail(authentication.getName());
        return result == null
                ? ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "LATEST_ANALYSIS_NOT_FOUND"))
                : ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public List<DeepService.DayHistoryDto> getDeepHistory(Authentication authentication) {
        return deepService.getDeepHistory(authentication.getName());
    }

    @GetMapping("/{dtypeCode}")
    public ResponseEntity<Deepmodel> getDeepmodel(
            Authentication authentication,
            @PathVariable Long dtypeCode) {
        Deepmodel result = deepService.getDeepmodel(dtypeCode, authentication.getName());
        return result == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(result);
    }

    @DeleteMapping("/today")
    public ResponseEntity<Map<String, Object>> deleteTodayPredict(Authentication authentication) {
        return deletedResponse(deepService.deleteTodayDeepmodels(authentication.getName()));
    }

    @DeleteMapping("/latest")
    public ResponseEntity<Map<String, Object>> deleteLatestPredict(Authentication authentication) {
        return deletedResponse(deepService.deleteLatestDeepmodels(authentication.getName()));
    }

    @DeleteMapping("/date")
    public ResponseEntity<Map<String, Object>> deletePredictByDate(
            Authentication authentication,
            @RequestParam String date) {
        int deletedCount = deepService.deleteDeepmodelsByDate(authentication.getName(), date);
        if (deletedCount < 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "INVALID_DATE", "deletedCount", deletedCount));
        }
        return deletedResponse(deletedCount);
    }

    @DeleteMapping("/{dtypeCode}")
    public ResponseEntity<Void> deleteDeepmodel(
            Authentication authentication,
            @PathVariable Long dtypeCode) {
        return deepService.deleteDeepmodel(dtypeCode, authentication.getName())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    private ResponseEntity<Map<String, Object>> deletedResponse(int deletedCount) {
        if (deletedCount <= 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "ANALYSIS_NOT_FOUND", "deletedCount", deletedCount));
        }
        return ResponseEntity.ok(Map.of("message", "ANALYSIS_DELETED", "deletedCount", deletedCount));
    }

    public static class SaveRequest {
        private List<Detection> detections;
        private String imgPath;

        public List<Detection> getDetections() {
            return detections;
        }

        public void setDetections(List<Detection> detections) {
            this.detections = detections;
        }

        public String getImgPath() {
            return imgPath;
        }

        public void setImgPath(String imgPath) {
            this.imgPath = imgPath;
        }
    }

    public static class Detection {
        @JsonProperty("dtype_result")
        private String dtypeResult;

        @JsonProperty("dtype_cnt")
        private Integer dtypeCnt;

        public String getDtypeResult() {
            return dtypeResult;
        }

        public void setDtypeResult(String dtypeResult) {
            this.dtypeResult = dtypeResult;
        }

        public Integer getDtypeCnt() {
            return dtypeCnt;
        }

        public void setDtypeCnt(Integer dtypeCnt) {
            this.dtypeCnt = dtypeCnt;
        }
    }
}
