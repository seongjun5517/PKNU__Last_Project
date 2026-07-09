package com.Skin_Predict_Platform.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.service.DeepService;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/deep")
@RequiredArgsConstructor
@Slf4j
public class DeepController {

    private final DeepService deepService;

    @PostMapping("/save")
    public ResponseEntity<?> save(@RequestBody SaveRequest request) {

        log.info("userId = {}", request.getUserId());
        log.info("imgPath = {}", request.getImgPath());

        for (Detection d : request.getDetections()) {
            log.info("result = {}", d.getDtypeResult());
            log.info("cnt = {}", d.getDtypeCnt());
        }

        List<String> results = request.getDetections().stream()
                .map(Detection::getDtypeResult).toList();
        List<Integer> counts = request.getDetections().stream()
                .map(Detection::getDtypeCnt).toList();

        boolean saved = deepService.savePrediction(
                request.getUserId(), results, counts, request.getImgPath());

        if (!saved) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "예측 결과 저장에 실패했습니다."));
        }

        return ResponseEntity.ok(Map.of("message", "저장 완료"));
    }

    /**
     * 오늘 이미 예측한 결과(imgPath + detections)를 반환.
     * 오늘 기록이 없으면 404.
     */
    @GetMapping("/today")
    public ResponseEntity<?> getTodayPredict(@RequestParam String userId) {
        DeepService.TodayPredictResult todayResult = deepService.getTodayPredictDetail(userId);

        if (todayResult == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "오늘 예측 결과 없음"));
        }

        return ResponseEntity.ok(todayResult);
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestPredict(@RequestParam String userId) {
        DeepService.TodayPredictResult latestResult = deepService.getLatestPredictDetail(userId);

        if (latestResult == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "최신 예측 결과 없음"));
        }

        return ResponseEntity.ok(latestResult);
    }

    @DeleteMapping("/today")
    public ResponseEntity<Map<String, Object>> deleteTodayPredict(@RequestParam String userId) {
        int deletedCount = deepService.deleteTodayDeepmodels(userId);

        if (deletedCount <= 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "삭제할 오늘 예측 결과 없음", "deletedCount", deletedCount));
        }

        return ResponseEntity.ok(Map.of("message", "오늘 예측 결과 삭제 완료", "deletedCount", deletedCount));
    }

    @DeleteMapping("/latest")
    public ResponseEntity<Map<String, Object>> deleteLatestPredict(@RequestParam String userId) {
        int deletedCount = deepService.deleteLatestDeepmodels(userId);

        if (deletedCount <= 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "삭제할 최신 예측 결과 없음", "deletedCount", deletedCount));
        }

        return ResponseEntity.ok(Map.of("message", "최신 예측 결과 삭제 완료", "deletedCount", deletedCount));
    }

    @DeleteMapping("/date")
    public ResponseEntity<Map<String, Object>> deletePredictByDate(
            @RequestParam String userId,
            @RequestParam String date) {
        int deletedCount = deepService.deleteDeepmodelsByDate(userId, date);

        if (deletedCount < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "날짜 형식이 올바르지 않습니다.", "deletedCount", deletedCount));
        }

        if (deletedCount == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "삭제할 예측 결과 없음", "deletedCount", deletedCount));
        }

        return ResponseEntity.ok(Map.of("message", "예측 결과 삭제 완료", "deletedCount", deletedCount));
    }

    @DeleteMapping("/{dtypeCode}")
    public ResponseEntity<Map<String, String>> deleteDeepmodel(@PathVariable Long dtypeCode) {
        boolean deleted = deepService.deleteDeepmodelByDtypecode(dtypeCode);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "삭제 완료"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "해당 데이터 없음"));
    }

    public static class SaveRequest {
        private String userId;
        private List<Detection> detections;
        private String imgPath;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public List<Detection> getDetections() { return detections; }
        public void setDetections(List<Detection> detections) { this.detections = detections; }
        public String getImgPath() { return imgPath; }
        public void setImgPath(String imgPath) { this.imgPath = imgPath; }
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

    /**
     * 유저의 전체 예측 기록을 날짜별로 그룹핑해서 반환.
     */
    @GetMapping("/history")
    public ResponseEntity<?> getDeepHistory(@RequestParam String userId) {
        List<DeepService.DayHistoryDto> history = deepService.getDeepHistory(userId);
        return ResponseEntity.ok(history);
    }
}
