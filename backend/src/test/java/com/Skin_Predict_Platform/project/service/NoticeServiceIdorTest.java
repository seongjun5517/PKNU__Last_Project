package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Skin_Predict_Platform.project.model.Notice;
import com.Skin_Predict_Platform.project.repository.ManagerRepository;
import com.Skin_Predict_Platform.project.repository.NoticeRepository;

@ExtendWith(MockitoExtension.class)
class NoticeServiceIdorTest {

    private static final String USER_A = "idor-user-a";
    private static final long USER_B_NOTICE_CODE = 700L;

    @Mock
    private NoticeRepository noticeRepository;
    @Mock
    private ManagerRepository managerRepository;

    @InjectMocks
    private NoticeService noticeService;

    @Test
    void userACannotReadOrDeleteUserBNotificationByCode() {
        when(noticeRepository.findByNotiCodeAndNotiReceiverUserId(USER_B_NOTICE_CODE, USER_A))
                .thenReturn(Optional.empty());

        assertFalse(noticeService.markAsRead(USER_B_NOTICE_CODE, USER_A));
        assertFalse(noticeService.deleteNotification(USER_B_NOTICE_CODE, USER_A));

        verify(noticeRepository, never()).delete(any(Notice.class));
        verify(noticeRepository, never()).save(any(Notice.class));
    }
}
