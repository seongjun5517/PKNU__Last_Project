package com.Skin_Predict_Platform.project.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Skin_Predict_Platform.project.dto.SkinTypeResultItem;
import com.Skin_Predict_Platform.project.dto.SkinTypeResultSaveRequest;
import com.Skin_Predict_Platform.project.model.SkinTypeResult;
import com.Skin_Predict_Platform.project.repository.SkinTypeResultRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SkinTypeResultService {

    private final SkinTypeResultRepository skinTypeResultRepository;

    @Transactional
    public List<SkinTypeResult> saveResults(SkinTypeResultSaveRequest request) {
        if (request == null || isBlank(request.getUserId()) || request.getResults() == null
                || request.getResults().isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime diagnosedAt = LocalDateTime.now();
        List<SkinTypeResult> results = request.getResults().stream()
                .map((item) -> toEntity(request.getUserId(), diagnosedAt, item))
                .collect(Collectors.toList());

        return skinTypeResultRepository.saveAll(results);
    }

    @Transactional(readOnly = true)
    public List<SkinTypeResult> getLatestResults(String userId) {
        if (isBlank(userId)) {
            return Collections.emptyList();
        }

        // stype_date 를 최신 진단시간으로 봐서 최신 진단 데이터를 가져오도록 함.
        List<SkinTypeResult> allResults =
                skinTypeResultRepository.findAllByUserId(userId);

        if (allResults.isEmpty()) {
            return allResults;
        }

        LocalDateTime latestDate = allResults.get(0).getStypeDate();
        return allResults.stream()
                .filter((result) -> latestDate.equals(result.getStypeDate()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkinTypeResult> getTodayResults(String userId) {
        if (isBlank(userId)) {
            return Collections.emptyList();
        }

        LocalDateTime startDate = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = startDate.plusDays(1);
        List<SkinTypeResult> allResults =
                skinTypeResultRepository
                        .findByUserIdAndDateRange(
                                userId,
                                startDate,
                                endDate
                        );

        return getLatestGroup(allResults);
    }

    @Transactional
    public long deleteTodayResults(String userId) {
        if (isBlank(userId)) {
            return 0;
        }

        LocalDateTime startDate = LocalDate.now().atStartOfDay();
        LocalDateTime endDate = startDate.plusDays(1);
        return skinTypeResultRepository
                .deleteByUserIdAndDateRange(
                        userId,
                        startDate,
                        endDate
                );
    }

    @Transactional
    public long deleteLatestResults(String userId) {
        if (isBlank(userId)) {
            return 0;
        }

        List<SkinTypeResult> latestResults = getLatestResults(userId);

        if (latestResults.isEmpty()) {
            return 0;
        }

        skinTypeResultRepository.deleteAll(latestResults);
        return latestResults.size();
    }

    private List<SkinTypeResult> getLatestGroup(List<SkinTypeResult> allResults) {
        if (allResults.isEmpty()) {
            return allResults;
        }

        LocalDateTime latestDate = allResults.get(0).getStypeDate();
        return allResults.stream()
                .filter((result) -> latestDate.equals(result.getStypeDate()))
                .collect(Collectors.toList());
    }

    private SkinTypeResult toEntity(String userId, LocalDateTime diagnosedAt, SkinTypeResultItem item) {
        return SkinTypeResult.builder()
                .stypeUserId(userId)
                .stypeDate(diagnosedAt)
                .stypeFace(item.getStypeFace())
                .stypeName(item.getStypeName())
                .stypeFig(item.getStypeFig())
                .build();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    // 마이페이지 그래프 관련 함수
    @Transactional(readOnly = true)
    public List<SkinTypeResult> getAllResults(String userId) {
        if (isBlank(userId)) {
            return Collections.emptyList();
        }
        return skinTypeResultRepository.findAllByUserId(userId);
    }
}
