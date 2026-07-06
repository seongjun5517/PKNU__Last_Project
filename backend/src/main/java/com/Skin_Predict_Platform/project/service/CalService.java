package com.Skin_Predict_Platform.project.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.Skin_Predict_Platform.project.model.Calendar;
import com.Skin_Predict_Platform.project.repository.CalRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalService {
    
    private final CalRepository calRepository;

    // 캘린더 전체 목록 조회
    public List<Calendar> getcalenderlist() {
        log.info("캘린더 전체 목록 조회 시작");

        return this.calRepository.findAll();
    }


    // 캘린더 한건 조회
    public Calendar getcalendarView(String calCode) {
        Optional<Calendar> cal = this.calRepository.findById(calCode);

        if (cal.isPresent()) {
            log.info("회원아이디 [%s]에 대한 정보를 정상적으로 조회했습니다.".formatted(calCode));

            return cal.get();
        }

        return null;
    }

    // 캘린더 수정
    public String setCalUpdate(String calCode, String calDescription) {
        log.info("calCode = [%s], 수정할 내용 = [%s]".formatted(calCode, calDescription));

        Optional<Calendar> cal = this.calRepository.findById(calCode);

        if (cal.isPresent()) {
            Calendar cal_update = cal.get();
            cal_update.setCalDescription(calDescription);
            this.calRepository.save(cal_update);

            return "회원 캘린더 정보가 수정되었습니다.";
        }

        return "회원 캘린더 정보가 존재하지 않습니다.";
    }

    
    // 캘린더 정보 삭제
    public String setCalDelete(String calCode) {
        if (this.calRepository.existsById(calCode)) {

            this.calRepository.deleteById(calCode);
            return "[%s] 해당 캘린더 정보가 삭제 되었습니다".formatted(calCode);
        }

        return "[%s]에 대한 정보가 존재하지 않습니다.".formatted(calCode);
    }

    
    // 캘린더 정보 삽입
    
}
