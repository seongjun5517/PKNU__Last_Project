package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

import com.Skin_Predict_Platform.project.dto.CommunityCommentUpdateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.model.CommunityComment;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.model.Role;
import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.repository.CommunityCategoryRepository;
import com.Skin_Predict_Platform.project.repository.CommunityCommentRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostLikeRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostScrapRepository;
import com.Skin_Predict_Platform.project.repository.CommunityReportRepository;
import com.Skin_Predict_Platform.project.repository.PostDetailRepository;
import com.Skin_Predict_Platform.project.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CommunityServiceIdorTest {

    private static final String USER_A = "idor-user-a";
    private static final String USER_B = "idor-user-b";

    @Mock
    private PostDetailRepository postDetailRepository;
    @Mock
    private CommunityCategoryRepository communityCategoryRepository;
    @Mock
    private CommunityPostLikeRepository communityPostLikeRepository;
    @Mock
    private CommunityPostScrapRepository communityPostScrapRepository;
    @Mock
    private CommunityReportRepository communityReportRepository;
    @Mock
    private CommunityCommentRepository communityCommentRepository;
    @Mock
    private NoticeService noticeService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommunityService communityService;

    @Test
    void userACannotUpdateUserBPost() {
        PostDetail userBPost = postOwnedBy(USER_B, 400L, "B's title");
        CommunityPostCreateRequest update = new CommunityPostCreateRequest();
        update.setCategoryCode(1L);
        update.setPostTitle("attacker title");

        when(postDetailRepository.findById(400L)).thenReturn(Optional.of(userBPost));

        assertThrows(
                SecurityException.class,
                () -> communityService.updatePost(400L, USER_A, update));

        verify(postDetailRepository, never()).save(any(PostDetail.class));
        assertEquals("B's title", userBPost.getPostTitle());
    }

    @Test
    void userACannotDeleteUserBPost() {
        PostDetail userBPost = postOwnedBy(USER_B, 401L, "B's title");
        when(postDetailRepository.findById(401L)).thenReturn(Optional.of(userBPost));
        when(userRepository.findById(USER_A)).thenReturn(Optional.of(normalUser(USER_A)));

        assertFalse(communityService.deletePost(401L, USER_A));

        verify(postDetailRepository, never()).delete(any(PostDetail.class));
        verify(communityReportRepository, never()).deleteByReportPostCode(401L);
        verify(communityCommentRepository, never()).deleteByCmtPostCode(401L);
        verify(communityPostLikeRepository, never()).deleteByLikePostCode(401L);
        verify(communityPostScrapRepository, never()).deleteByScrapPostCode(401L);
        verify(noticeService, never()).deleteByPostCode(401L);
    }

    @Test
    void userACannotUpdateUserBComment() {
        CommunityComment userBComment = commentOwnedBy(USER_B, 500L, "B's comment");
        CommunityCommentUpdateRequest update = new CommunityCommentUpdateRequest();
        update.setContents("attacker comment");

        when(communityCommentRepository.findById(500L))
                .thenReturn(Optional.of(userBComment));

        assertThrows(
                SecurityException.class,
                () -> communityService.updateComment(500L, USER_A, update));

        verify(communityCommentRepository, never()).save(any(CommunityComment.class));
        assertEquals("B's comment", userBComment.getCmtContents());
    }

    @Test
    void userACannotDeleteUserBComment() {
        CommunityComment userBComment = commentOwnedBy(USER_B, 501L, "B's comment");
        when(communityCommentRepository.findById(501L))
                .thenReturn(Optional.of(userBComment));
        when(userRepository.findById(USER_A)).thenReturn(Optional.of(normalUser(USER_A)));

        assertFalse(communityService.deleteComment(501L, USER_A));

        verify(communityCommentRepository, never()).delete(any(CommunityComment.class));
        verify(noticeService, never()).deleteByCommentCode(501L);
    }

    private PostDetail postOwnedBy(String userId, Long postCode, String title) {
        return PostDetail.builder()
                .postCode(postCode)
                .postUserId(userId)
                .categoryCode(1L)
                .postTitle(title)
                .build();
    }

    private CommunityComment commentOwnedBy(String userId, Long commentCode, String contents) {
        return CommunityComment.builder()
                .cmtCode(commentCode)
                .cmtPostCode(400L)
                .cmtUserId(userId)
                .cmtContents(contents)
                .build();
    }

    private User normalUser(String userId) {
        return User.builder()
                .userId(userId)
                .role(Role.USER)
                .build();
    }
}
