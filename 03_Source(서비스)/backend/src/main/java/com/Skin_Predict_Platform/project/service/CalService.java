package com.Skin_Predict_Platform.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Skin_Predict_Platform.project.dto.CalendarRequest;
import com.Skin_Predict_Platform.project.model.Calendar;
import com.Skin_Predict_Platform.project.repository.CalRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalService {

    private final CalRepository calRepository;

    @Transactional(readOnly = true)
    public List<Calendar> getCalendarList(String userId) {
        return calRepository.findByCalUserId(userId);
    }

    @Transactional(readOnly = true)
    public Calendar getCalendar(Long calCode, String userId) {
        return calRepository.findByCalCodeAndCalUserId(calCode, userId).orElse(null);
    }

    @Transactional
    public Calendar insertCalendar(String userId, CalendarRequest request) {
        Calendar calendar = Calendar.builder()
                .calUserId(userId)
                .calTaskDate(request.getCalTaskDate())
                .calTitle(request.getCalTitle())
                .calIsCompleted(request.getCalIsCompleted())
                .calImgPath(request.getCalImgPath())
                .calCategory(request.getCalCategory())
                .build();
        return calRepository.save(calendar);
    }

    @Transactional
    public Calendar updateCalendar(Long calCode, String userId, CalendarRequest request) {
        Calendar calendar = calRepository
                .findByCalCodeAndCalUserId(calCode, userId)
                .orElse(null);
        if (calendar == null) {
            return null;
        }

        calendar.setCalTitle(request.getCalTitle());
        calendar.setCalTaskDate(request.getCalTaskDate());
        calendar.setCalCategory(request.getCalCategory());
        calendar.setCalIsCompleted(request.getCalIsCompleted());
        if (request.getCalImgPath() != null) {
            calendar.setCalImgPath(request.getCalImgPath());
        }
        return calRepository.save(calendar);
    }

    @Transactional
    public boolean deleteCalendar(Long calCode, String userId) {
        Calendar calendar = calRepository
                .findByCalCodeAndCalUserId(calCode, userId)
                .orElse(null);
        if (calendar == null) {
            return false;
        }
        calRepository.delete(calendar);
        return true;
    }
}
