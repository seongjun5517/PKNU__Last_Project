package com.Skin_Predict_Platform.project.service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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

    public String getTodayPredictByUserId(String userId) {
        Optional<String> result = this.deeprepository.findTodayPredictByUserId(userId);
        if (result.isPresent()) {
            log.info("오늘 예측 결과 조회 성공. userId={}", userId);
            return result.get();
        }
        log.warn("오늘 예측 결과가 존재하지 않음. userId={}", userId);
        return "";
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
}