package com.Skin_Predict_Platform.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.NoticeResponse;
import com.Skin_Predict_Platform.project.service.NoticeService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<NoticeResponse>> getNotifications(@RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(noticeService.getNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(Map.of("count", noticeService.getUnreadCount(userId)));
    }

    @PatchMapping("/{notiCode}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notiCode,
            @RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        if (!noticeService.markAsRead(notiCode, userId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        noticeService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/read")
    public ResponseEntity<Void> deleteReadNotifications(@RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        noticeService.deleteReadNotifications(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notiCode}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notiCode,
            @RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        if (!noticeService.deleteNotification(notiCode, userId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
