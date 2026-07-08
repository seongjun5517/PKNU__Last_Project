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

    // 사용자별 캘린더 목록 조회
    public List<Calendar> getCalendarListByUserId(String userId) {
        log.info("사용자별 캘린더 목록 조회 시작: userId = [%s]".formatted(userId));

        return this.calRepository.findByCalUserId(userId);
    }


    // 캘린더 한건 조회
    public Calendar getcalendarView(Long calCode) {
        Optional<Calendar> cal = this.calRepository.findById(calCode);

        if (cal.isPresent()) {
            log.info("회원아이디 [%s]에 대한 정보를 정상적으로 조회했습니다.".formatted(calCode));

            return cal.get();
        }

        return null;
    }

    // 캘린더 수정
    public Calendar setCalUpdate(Long calCode, Calendar updated) {
    log.info("calCode = [%s] 수정 요청".formatted(calCode));

    Optional<Calendar> cal = this.calRepository.findById(calCode);

    if (cal.isPresent()) {
        Calendar cal_update = cal.get();

        cal_update.setCalTitle(updated.getCalTitle());
        cal_update.setCalTaskDate(updated.getCalTaskDate());
        cal_update.setCalCategory(updated.getCalCategory());
        cal_update.setCalIsCompleted(updated.getCalIsCompleted());

        if (updated.getCalImgPath() != null) {
            cal_update.setCalImgPath(updated.getCalImgPath());
        }

        return this.calRepository.save(cal_update);
    }

    throw new RuntimeException("[%s]에 대한 캘린더 정보가 존재하지 않습니다.".formatted(calCode));
}

    
    // 캘린더 정보 삭제
    public String setCalDelete(Long calCode) {
        if (this.calRepository.existsById(calCode)) {

            this.calRepository.deleteById(calCode);
            return "[%s] 해당 캘린더 정보가 삭제 되었습니다".formatted(calCode);
        }

        return "[%s]에 대한 정보가 존재하지 않습니다.".formatted(calCode);
    }

    
    // 캘린더 정보 삽입
    public Calendar setCalInsert(Calendar calendar) {
        log.info("캘린더 정보 삽입 시작: [%s]".formatted(calendar.getCalTitle()));
        
        // save 메서드는 해당 객체가 새로운 것이면 INSERT를, 
        // 이미 존재하는 ID라면 UPDATE를 수행합니다.
        return this.calRepository.save(calendar);
    }
}
