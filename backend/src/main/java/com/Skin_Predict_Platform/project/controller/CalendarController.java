package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.CalendarRequest;
import com.Skin_Predict_Platform.project.model.Calendar;
import com.Skin_Predict_Platform.project.service.CalService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalService calService;

    @GetMapping
    public List<Calendar> getCalendarList(Authentication authentication) {
        return calService.getCalendarList(authentication.getName());
    }

    @GetMapping("/{calCode}")
    public ResponseEntity<Calendar> getCalendar(
            Authentication authentication,
            @PathVariable Long calCode) {
        Calendar calendar = calService.getCalendar(calCode, authentication.getName());
        return calendar == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(calendar);
    }

    @PostMapping
    public Calendar insertCalendar(
            Authentication authentication,
            @RequestBody CalendarRequest request) {
        return calService.insertCalendar(authentication.getName(), request);
    }

    @PutMapping("/{calCode}")
    public ResponseEntity<Calendar> updateCalendar(
            Authentication authentication,
            @PathVariable Long calCode,
            @RequestBody CalendarRequest request) {
        Calendar calendar = calService.updateCalendar(calCode, authentication.getName(), request);
        return calendar == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(calendar);
    }

    @DeleteMapping("/{calCode}")
    public ResponseEntity<Void> deleteCalendar(
            Authentication authentication,
            @PathVariable Long calCode) {
        return calService.deleteCalendar(calCode, authentication.getName())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
