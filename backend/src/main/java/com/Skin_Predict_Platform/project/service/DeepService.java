package com.Skin_Predict_Platform.project.service;

import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Skin_Predict_Platform.project.model.Deepmodel;
import com.Skin_Predict_Platform.project.repository.DeepRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeepService {

    private final DeepRepository deeprepository;

    public List<Deepmodel> getDeepmodelDataByDtypecode(Long dtypeCode) {
        Optional<Deepmodel> deep = this.deeprepository.findById(dtypeCode);
        if (deep.isPresent()) {
            log.info("정상적으로 조회함");
            return Collections.singletonList(deep.get());
        }
        log.warn("데이터가 존재하지않음");
        return Collections.emptyList();
    }

    /**
     * 기존 방식 (단일 문자열 반환) - 다른 곳에서 쓰고 있다면 유지
     */
    public String getTodayPredictByUserId(String userId) {
        Optional<String> result = this.deeprepository.findTodayPredictByUserId(userId);
        if (result.isPresent()) {
            log.info("오늘 예측 결과 조회 성공. userId={}", userId);
            return result.get();
        }
        log.warn("오늘 예측 결과가 존재하지 않음. userId={}", userId);
        return "";
    }

    /**
     * 오늘 예측한 detections(dtype_result/dtype_cnt 리스트) + imgPath를 함께 반환.
     * 오늘 기록이 없으면 null 반환.
     */
    public TodayPredictResult getTodayPredictDetail(String userId) {
        Date[] range = getTodayRange();
        List<Deepmodel> rows = this.deeprepository
                .findByDtypeUserIdAndDtypeDateBetween(userId, range[0], range[1]);

        if (rows.isEmpty()) {
            log.warn("오늘 예측 결과가 존재하지 않음. userId={}", userId);
            return null;
        }

        List<DetectionDto> detections = rows.stream()
                .map(r -> new DetectionDto(r.getDtypeResult(), r.getDtypeCnt()))
                .collect(Collectors.toList());

        // 같은 예측에서 저장된 row들은 imgPath가 동일하므로 첫 번째 값 사용
        String imgPath = rows.get(0).getDtypeImg();

        log.info("오늘 예측 결과 조회 성공. userId={}, 감지 수={}", userId, detections.size());
        return new TodayPredictResult(imgPath, detections);
    }

    public boolean hasPredictedToday(String userId) {
        return this.deeprepository.findTodayPredictByUserId(userId).isPresent();
    }

    /**
     * 프론트에서 넘어온 dtypeResult/dtypeCnt 쌍 리스트를 그대로 받아서 저장
     * (Flask에서 이미 처리된 detection 결과)
     */
    @Transactional
    public boolean savePrediction(String userId, List<String> dtypeResults,
                                   List<Integer> dtypeCnts, String imgPath) {
        if (hasPredictedToday(userId)) {
            log.warn("이미 오늘 예측을 완료한 유저. userId={}", userId);
            return false;
        }

        Date now = new Date();

        try {
            for (int i = 0; i < dtypeResults.size(); i++) {
                Deepmodel deep = new Deepmodel();
                deep.setDtypeUserId(userId);
                deep.setDtypeDate(now);
                deep.setDtypeResult(dtypeResults.get(i));
                deep.setDtypeCnt(dtypeCnts.get(i));
                deep.setDtypeImg(imgPath);
                this.deeprepository.save(deep);
            }
            log.info("예측 결과 저장 완료. userId={}, 클래스 수={}", userId, dtypeResults.size());
            return true;
        } catch (Exception e) {
            log.warn("저장 실패. userId={}, error={}", userId, e.getMessage());
            return false;
        }
    }

    @Transactional
    public boolean deleteDeepmodelByDtypecode(Long dtypeCode) {
        Optional<Deepmodel> deep = this.deeprepository.findById(dtypeCode);
        if (deep.isPresent()) {
            this.deeprepository.deleteById(dtypeCode);
            log.info("정상적으로 삭제함. dtypeCode={}", dtypeCode);
            return true;
        }
        log.warn("삭제할 데이터가 존재하지않음. dtypeCode={}", dtypeCode);
        return false;
    }

    private Date[] getTodayRange() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date start = cal.getTime();

        cal.add(Calendar.DAY_OF_MONTH, 1);
        Date end = cal.getTime();

        return new Date[] { start, end };
    }

    public static class DetectionDto {
        private String dtype_result;
        private Integer dtype_cnt;

        public DetectionDto(String dtypeResult, Integer dtypeCnt) {
            this.dtype_result = dtypeResult;
            this.dtype_cnt = dtypeCnt;
        }

        public String getDtype_result() { return dtype_result; }
        public Integer getDtype_cnt() { return dtype_cnt; }
    }

    public static class TodayPredictResult {
        private String imgPath;
        private List<DetectionDto> detections;

        public TodayPredictResult(String imgPath, List<DetectionDto> detections) {
            this.imgPath = imgPath;
            this.detections = detections;
        }

        public String getImgPath() { return imgPath; }
        public List<DetectionDto> getDetections() { return detections; }
    }
}