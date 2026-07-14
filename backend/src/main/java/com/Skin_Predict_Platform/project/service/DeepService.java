package com.Skin_Predict_Platform.project.service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    public TodayPredictResult getLatestPredictDetail(String userId) {
        List<Deepmodel> rows = getLatestDeepmodelGroup(userId);

        if (rows.isEmpty()) {
            log.warn("최신 예측 결과가 존재하지 않음. userId={}", userId);
            return null;
        }

        List<DetectionDto> detections = rows.stream()
                .map(r -> new DetectionDto(r.getDtypeResult(), r.getDtypeCnt()))
                .collect(Collectors.toList());

        String imgPath = rows.get(0).getDtypeImg();

        log.info("최신 예측 결과 조회 성공. userId={}, 감지 수={}", userId, detections.size());
        return new TodayPredictResult(imgPath, detections);
    }

    public LocalDateTime getLatestPredictionAt(String userId) {
        List<Deepmodel> rows = getLatestDeepmodelGroup(userId);
        if (rows.isEmpty() || rows.get(0).getDtypeDate() == null) {
            return null;
        }

        return LocalDateTime.ofInstant(
                rows.get(0).getDtypeDate().toInstant(),
                ZoneId.systemDefault());
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
        Date now = new Date();

        try {
            // A detection-free response means the skin is normal.  It still needs a
            // row so the result can be restored later and feedback can be linked to it.
            if (dtypeResults == null || dtypeResults.isEmpty()) {
                Deepmodel normalResult = new Deepmodel();
                normalResult.setDtypeUserId(userId);
                normalResult.setDtypeDate(now);
                normalResult.setDtypeResult("NORMAL");
                normalResult.setDtypeCnt(0);
                normalResult.setDtypeImg(imgPath);
                this.deeprepository.save(normalResult);

                log.info("Normal skin result saved. userId={}", userId);
                return true;
            }

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

    @Transactional
    public int deleteTodayDeepmodels(String userId) {
        Date[] range = getTodayRange();
        return deleteDeepmodelsByRange(userId, range[0], range[1]);
    }

    @Transactional
    public int deleteLatestDeepmodels(String userId) {
        List<Deepmodel> rows = getLatestDeepmodelGroup(userId);

        if (rows.isEmpty()) {
            log.warn("삭제할 최신 예측 결과가 존재하지 않음. userId={}", userId);
            return 0;
        }

        this.deeprepository.deleteAll(rows);
        log.info("최신 예측 결과 삭제 완료. userId={}, count={}", userId, rows.size());
        return rows.size();
    }

    @Transactional
    public int deleteDeepmodelsByDate(String userId, String dateKey) {
        Date[] range = getDateRange(dateKey);
        if (range == null) {
            return -1;
        }
        return deleteDeepmodelsByRange(userId, range[0], range[1]);
    }

    private int deleteDeepmodelsByRange(String userId, Date start, Date end) {
        List<Deepmodel> rows = this.deeprepository
                .findByDtypeUserIdAndDtypeDateBetween(userId, start, end);

        if (rows.isEmpty()) {
            log.warn("삭제할 예측 결과가 존재하지 않음. userId={}", userId);
            return 0;
        }

        this.deeprepository.deleteAll(rows);
        log.info("예측 결과 삭제 완료. userId={}, count={}", userId, rows.size());
        return rows.size();
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

    private List<Deepmodel> getLatestDeepmodelGroup(String userId) {
        List<Deepmodel> allRows = this.deeprepository
                .findByDtypeUserIdOrderByDtypeDateDescDtypeCodeAsc(userId);

        if (allRows.isEmpty()) {
            return Collections.emptyList();
        }

        Date latestDate = allRows.get(0).getDtypeDate();
        return allRows.stream()
                .filter(row -> latestDate.equals(row.getDtypeDate()))
                .collect(Collectors.toList());
    }

    private Date[] getDateRange(String dateKey) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            sdf.setLenient(false);
            Date start = sdf.parse(dateKey);

            Calendar cal = Calendar.getInstance();
            cal.setTime(start);
            cal.add(Calendar.DAY_OF_MONTH, 1);
            Date end = cal.getTime();

            return new Date[] { start, end };
        } catch (Exception e) {
            log.warn("잘못된 날짜 형식입니다. dateKey={}", dateKey);
            return null;
        }
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

    /**
     * 유저의 전체 예측 기록을 날짜별로 그룹핑해서 반환.
     */
    public List<DayHistoryDto> getDeepHistory(String userId) {
        List<Deepmodel> rows = this.deeprepository.findByDtypeUserIdOrderByDtypeDateAsc(userId);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Map<String, List<DetectionDto>> grouped = new LinkedHashMap<>();
        Map<String, String> imageByDate = new LinkedHashMap<>();

        for (Deepmodel r : rows) {
            String dateKey = sdf.format(r.getDtypeDate());
            grouped.computeIfAbsent(dateKey, k -> new java.util.ArrayList<>())
                .add(new DetectionDto(r.getDtypeResult(), r.getDtypeCnt()));
            imageByDate.putIfAbsent(dateKey, r.getDtypeImg());
        }

        return grouped.entrySet().stream()
                .map(e -> new DayHistoryDto(e.getKey(), imageByDate.get(e.getKey()), e.getValue()))
                .collect(Collectors.toList());
    }

    public static class DayHistoryDto {
        private String date;
        private String imgPath;
        private List<DetectionDto> detections;

        public DayHistoryDto(String date, String imgPath, List<DetectionDto> detections) {
            this.date = date;
            this.imgPath = imgPath;
            this.detections = detections;
        }

        public String getDate() { return date; }
        public String getImgPath() { return imgPath; }
        public List<DetectionDto> getDetections() { return detections; }
    }
}
