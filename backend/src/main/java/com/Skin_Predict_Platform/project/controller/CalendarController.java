package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.model.Calendar;
import com.Skin_Predict_Platform.project.service.CalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/calendar") // 기본 경로 설정
@RequiredArgsConstructor
public class CalendarController {

    private final CalService calService;

    // 1. 전체 목록 조회 (GET /calendar)
    @GetMapping("")
    public List<Calendar> getAllCalendarList() {
        return calService.getcalenderlist();
    }

    // 2. 한 건 조회 (GET /calendar/{calCode})
    @GetMapping("/{calCode}")
    public Calendar getCalendar(@PathVariable Long calCode) {
        return calService.getcalendarView(calCode);
    }

    // 3. 삽입 (POST /calendar)
    @PostMapping("")
    public String insertCalendar(@RequestBody Calendar calendar) {
        return calService.setCalInsert(calendar);
    }

    // 4. 수정 (PUT /calendar/{calCode})
    // 요청 예: JSON으로 {"calDescription": "수정할 내용"} 등을 보내거나 
    // 파라미터로 받아서 처리
    @PutMapping("/{calCode}")
    public String updateCalendar(@PathVariable Long calCode, @RequestParam String calDescription) {
        return calService.setCalUpdate(calCode, calDescription);
    }

    // 5. 삭제 (DELETE /calendar/{calCode})
    @DeleteMapping("/{calCode}")
    public String deleteCalendar(@PathVariable Long calCode) {
        return calService.setCalDelete(calCode);
    }
}