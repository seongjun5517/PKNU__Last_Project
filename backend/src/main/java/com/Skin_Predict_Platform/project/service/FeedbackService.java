package com.Skin_Predict_Platform.project.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Skin_Predict_Platform.project.dto.FeedbackCreateRequest;
import com.Skin_Predict_Platform.project.dto.FeedbackResponse;
import com.Skin_Predict_Platform.project.model.Feedback;
import com.Skin_Predict_Platform.project.model.User;
import com.Skin_Predict_Platform.project.repository.FeedbackRepository;
import com.Skin_Predict_Platform.project.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final List<String> FEEDBACK_TYPES = List.of("SKIN_TYPE", "SKIN_STATUS");
    private static final List<String> EVALUATIONS = List.of("HELPFUL", "DISAPPOINTED");

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final SkinTypeResultService skinTypeResultService;
    private final DeepService deepService;

    @Transactional
    public FeedbackResponse create(FeedbackCreateRequest request) {
        if (request == null || isBlank(request.getUserId()) ||
                !FEEDBACK_TYPES.contains(request.getFeedbackType()) ||
                !EVALUATIONS.contains(request.getEvaluation())) {
            throw new IllegalArgumentException("피드백 입력값이 올바르지 않습니다.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        LocalDateTime latestAnalysisAt = getLatestAnalysisAt(user.getUserId(), request.getFeedbackType());
        if (latestAnalysisAt == null) {
            throw new IllegalArgumentException("피드백을 제출할 분석 결과가 없습니다.");
        }
        if (feedbackRepository.existsByFbUserIdAndFbTypeAndFbCreatedAtGreaterThanEqual(
                user.getUserId(), request.getFeedbackType(), latestAnalysisAt)) {
            throw new IllegalStateException("이미 제출한 피드백입니다. 재진단 후 다시 작성할 수 있습니다.");
        }
        String comment = isBlank(request.getComment()) ? null : request.getComment().trim();

        Feedback saved = feedbackRepository.save(new Feedback(
                null,
                user.getUserId(),
                request.getFeedbackType(),
                request.getEvaluation(),
                comment,
                LocalDateTime.now()));

        return toResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public boolean hasSubmittedForLatestAnalysis(String userId, String feedbackType) {
        if (isBlank(userId) || !FEEDBACK_TYPES.contains(feedbackType)) {
            throw new IllegalArgumentException("피드백 조회 조건이 올바르지 않습니다.");
        }

        LocalDateTime latestAnalysisAt = getLatestAnalysisAt(userId, feedbackType);
        return latestAnalysisAt != null && feedbackRepository
                .existsByFbUserIdAndFbTypeAndFbCreatedAtGreaterThanEqual(userId, feedbackType, latestAnalysisAt);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAll() {
        return feedbackRepository.findAllByOrderByFbCreatedAtDesc().stream()
                .map(feedback -> toResponse(feedback,
                        userRepository.findById(feedback.getFbUserId()).orElse(null)))
                .toList();
    }

    private FeedbackResponse toResponse(Feedback feedback, User user) {
        String nickname = user == null ? null : user.getUserNickname();
        return new FeedbackResponse(
                feedback.getFbCode(),
                feedback.getFbUserId(),
                nickname,
                feedback.getFbType(),
                feedback.getFbEvaluate(),
                feedback.getFbComment(),
                feedback.getFbCreatedAt());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private LocalDateTime getLatestAnalysisAt(String userId, String feedbackType) {
        return "SKIN_TYPE".equals(feedbackType)
                ? skinTypeResultService.getLatestDiagnosisAt(userId)
                : deepService.getLatestPredictionAt(userId);
    }
}
