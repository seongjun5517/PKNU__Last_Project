package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Skin_Predict_Platform.project.dto.FeedbackCreateRequest;
import com.Skin_Predict_Platform.project.dto.FeedbackResponse;
import com.Skin_Predict_Platform.project.dto.PublicUserResponse;
import com.Skin_Predict_Platform.project.dto.SkinTypeResultItem;
import com.Skin_Predict_Platform.project.dto.SkinTypeResultSaveRequest;
import com.Skin_Predict_Platform.project.model.Feedback;
import com.Skin_Predict_Platform.project.model.SkinTypeResult;
import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.repository.FeedbackRepository;
import com.Skin_Predict_Platform.project.repository.SkinTypeResultRepository;
import com.Skin_Predict_Platform.project.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SessionOwnedRequestTest {

    private static final String USER_A = "idor-user-a";

    @Mock
    private FeedbackRepository feedbackRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SkinTypeResultService skinTypeResultService;
    @Mock
    private DeepService deepService;
    @Mock
    private SkinTypeResultRepository skinTypeResultRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    @Test
    void identityBearingRequestFieldsWereRemoved() {
        assertFalse(fieldsOf(FeedbackCreateRequest.class).contains("userId"));
        assertFalse(fieldsOf(SkinTypeResultSaveRequest.class).contains("userId"));
    }

    @Test
    void publicProfileContainsNoPrivateAccountFields() {
        Set<String> fields = Arrays.stream(PublicUserResponse.class.getRecordComponents())
                .map(component -> component.getName())
                .collect(Collectors.toSet());

        assertEquals(Set.of("userId", "userNickname", "userProfileImage"), fields);
    }

    @Test
    void feedbackIsStoredForAuthenticatedUser() {
        FeedbackCreateRequest request = new FeedbackCreateRequest();
        request.setFeedbackType("SKIN_STATUS");
        request.setEvaluation("HELPFUL");
        User userA = User.builder().userId(USER_A).userNickname("A").build();
        LocalDateTime analysisAt = LocalDateTime.now().minusMinutes(1);

        when(userRepository.findById(USER_A)).thenReturn(Optional.of(userA));
        when(deepService.getLatestPredictionAt(USER_A)).thenReturn(analysisAt);
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> {
            Feedback feedback = invocation.getArgument(0);
            feedback.setFbCode(1L);
            return feedback;
        });

        FeedbackResponse response = feedbackService.create(USER_A, request);

        assertEquals(USER_A, response.getFbUserId());
        verify(userRepository).findById(USER_A);
        verify(deepService).getLatestPredictionAt(USER_A);
    }

    @Test
    void skinTypeSaveAssignsAuthenticatedUser() {
        SkinTypeResultItem item = new SkinTypeResultItem();
        item.setStypeName("DRY");
        SkinTypeResultSaveRequest request = new SkinTypeResultSaveRequest();
        request.setResults(List.of(item));
        SkinTypeResultService service = new SkinTypeResultService(skinTypeResultRepository);

        when(skinTypeResultRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SkinTypeResult> saved = service.saveResults(USER_A, request);

        assertEquals(1, saved.size());
        assertEquals(USER_A, saved.get(0).getStypeUserId());
    }

    private Set<String> fieldsOf(Class<?> type) {
        return Arrays.stream(type.getDeclaredFields())
                .map(Field::getName)
                .collect(Collectors.toSet());
    }
}
