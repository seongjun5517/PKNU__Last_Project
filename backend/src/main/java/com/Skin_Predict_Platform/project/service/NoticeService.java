package com.Skin_Predict_Platform.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.Skin_Predict_Platform.project.dto.NoticeResponse;
import com.Skin_Predict_Platform.project.model.CommunityComment;
import com.Skin_Predict_Platform.project.model.Notice;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.repository.NoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private static final String TYPE_LIKE = "LIKE";
    private static final String TYPE_COMMENT = "COMMENT";

    private final NoticeRepository noticeRepository;

    public List<NoticeResponse> getNotifications(String userId) {
        return noticeRepository.findByNotiReceiverUserIdOrderByNotiCreatedAtDesc(userId)
                .stream()
                .map(NoticeResponse::from)
                .toList();
    }

    public long getUnreadCount(String userId) {
        return noticeRepository.countByNotiReceiverUserIdAndNotiIsReadFalse(userId);
    }

    @Transactional
    public void createLikeNotification(PostDetail post, String senderUserId) {
        if (!canCreateNotification(post, senderUserId)) {
            return;
        }

        noticeRepository.save(Notice.builder()
                .notiSenderUserId(senderUserId)
                .notiReceiverUserId(post.getPostUserId())
                .notiPostCode(post.getPostCode())
                .notiType(TYPE_LIKE)
                .build());
    }

    @Transactional
    public void createCommentNotification(PostDetail post, CommunityComment comment) {
        if (comment == null || !canCreateNotification(post, comment.getCmtUserId())) {
            return;
        }

        noticeRepository.save(Notice.builder()
                .notiSenderUserId(comment.getCmtUserId())
                .notiReceiverUserId(post.getPostUserId())
                .notiPostCode(post.getPostCode())
                .notiCmtCode(comment.getCmtCode())
                .notiType(TYPE_COMMENT)
                .build());
    }

    @Transactional
    public boolean markAsRead(Long notiCode, String userId) {
        Notice notice = noticeRepository.findByNotiCodeAndNotiReceiverUserId(notiCode, userId)
                .orElse(null);
        if (notice == null) {
            return false;
        }

        notice.setNotiIsRead(true);
        return true;
    }

    @Transactional
    public void markAllAsRead(String userId) {
        noticeRepository.findByNotiReceiverUserIdAndNotiIsReadFalse(userId)
                .forEach((notice) -> notice.setNotiIsRead(true));
    }

    @Transactional
    public boolean deleteNotification(Long notiCode, String userId) {
        Notice notice = noticeRepository.findByNotiCodeAndNotiReceiverUserId(notiCode, userId)
                .orElse(null);
        if (notice == null) {
            return false;
        }

        noticeRepository.delete(notice);
        return true;
    }

    @Transactional
    public void deleteReadNotifications(String userId) {
        noticeRepository.deleteAll(noticeRepository.findByNotiReceiverUserIdAndNotiIsReadTrue(userId));
    }

    @Transactional
    public void deleteByPostCode(Long postCode) {
        noticeRepository.deleteByNotiPostCode(postCode);
    }

    @Transactional
    public void deleteByCommentCode(Long commentCode) {
        noticeRepository.deleteByNotiCmtCode(commentCode);
    }

    private boolean canCreateNotification(PostDetail post, String senderUserId) {
        return post != null
                && StringUtils.hasText(post.getPostUserId())
                && StringUtils.hasText(senderUserId)
                && !post.getPostUserId().equals(senderUserId);
    }
}
