package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Skin_Predict_Platform.project.model.CommunityReport;
import com.Skin_Predict_Platform.project.model.Notice;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.model.Role;
import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.repository.NoticeRepository;
import com.Skin_Predict_Platform.project.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NoticeServiceIdorTest {

    private static final String USER_A = "idor-user-a";
    private static final long USER_B_NOTICE_CODE = 700L;

    @Mock
    private NoticeRepository noticeRepository;
    @Mock
    private UserRepository userRepository;

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

    @Test
    void reportNotificationUsesTheSameSuperAdminRoleAsAuthentication() {
        User superAdmin = User.builder()
                .userId("admin")
                .role(Role.SUPER_ADMIN)
                .build();
        User reporterWithAdminRole = User.builder()
                .userId(USER_A)
                .role(Role.SUPER_ADMIN)
                .build();
        PostDetail post = PostDetail.builder()
                .postCode(401L)
                .postUserId("post-owner")
                .build();
        CommunityReport report = CommunityReport.builder()
                .reportPostCode(401L)
                .reportUserId(USER_A)
                .reportReason("SPAM_ADVERTISING")
                .build();

        when(userRepository.findByRole(Role.SUPER_ADMIN))
                .thenReturn(List.of(superAdmin, reporterWithAdminRole));

        noticeService.createReportNotifications(post, report);

        ArgumentCaptor<Notice> noticeCaptor = ArgumentCaptor.forClass(Notice.class);
        verify(noticeRepository).save(noticeCaptor.capture());
        Notice savedNotice = noticeCaptor.getValue();
        assertEquals(USER_A, savedNotice.getNotiSenderUserId());
        assertEquals("admin", savedNotice.getNotiReceiverUserId());
        assertEquals(401L, savedNotice.getNotiPostCode());
        assertEquals("REPORT", savedNotice.getNotiType());
    }
}
