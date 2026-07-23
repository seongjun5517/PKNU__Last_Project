package com.Skin_Predict_Platform.project.dto;

import java.time.LocalDateTime;

import com.Skin_Predict_Platform.project.model.Notice;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NoticeResponse {
    private Long notiCode;
    private String notiType;
    private String message;
    private String notiSenderUserId;
    private String notiReceiverUserId;
    private Long notiCmtCode;
    private Long notiPostCode;
    private LocalDateTime notiCreatedAt;
    private Boolean notiIsRead;

    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getNotiCode(),
                notice.getNotiType(),
                buildMessage(notice),
                notice.getNotiSenderUserId(),
                notice.getNotiReceiverUserId(),
                notice.getNotiCmtCode(),
                notice.getNotiPostCode(),
                notice.getNotiCreatedAt(),
                notice.getNotiIsRead());
    }

    private static String buildMessage(Notice notice) {
        String sender = notice.getNotiSenderUserId();
        if ("REPORT_DELETED".equalsIgnoreCase(notice.getNotiType())) {
            return "Your post was removed after reports.";
        }
        if ("REPORT".equalsIgnoreCase(notice.getNotiType())) {
            return sender + " reported a post.";
        }
        if ("COMMENT".equalsIgnoreCase(notice.getNotiType())) {
            return sender + "님이 내 게시글에 댓글을 남겼습니다.";
        }
        if ("LIKE".equalsIgnoreCase(notice.getNotiType())) {
            return sender + "님이 내 게시글을 좋아합니다.";
        }
        return "새 알림이 있습니다.";
    }
}
