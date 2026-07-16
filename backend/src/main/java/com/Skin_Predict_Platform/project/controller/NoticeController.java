package com.Skin_Predict_Platform.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public List<NoticeResponse> getNotifications(Authentication authentication) {
        return noticeService.getNotifications(authentication.getName());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        return Map.of("count", noticeService.getUnreadCount(authentication.getName()));
    }

    @PatchMapping("/{notiCode}/read")
    public ResponseEntity<Void> markAsRead(
            Authentication authentication,
            @PathVariable Long notiCode) {
        return noticeService.markAsRead(notiCode, authentication.getName())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        noticeService.markAllAsRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/read")
    public ResponseEntity<Void> deleteReadNotifications(Authentication authentication) {
        noticeService.deleteReadNotifications(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notiCode}")
    public ResponseEntity<Void> deleteNotification(
            Authentication authentication,
            @PathVariable Long notiCode) {
        return noticeService.deleteNotification(notiCode, authentication.getName())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
