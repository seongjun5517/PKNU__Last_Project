package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Skin_Predict_Platform.project.model.Deepmodel;
import com.Skin_Predict_Platform.project.repository.DeepRepository;

@ExtendWith(MockitoExtension.class)
class DeepServiceDateTimeTest {

    private static final String USER_ID = "feedback-user";

    @Mock
    private DeepRepository deepRepository;

    @InjectMocks
    private DeepService deepService;

    @Test
    void latestPredictionTimeIsReturnedWithoutUnsupportedDateConversion() {
        LocalDateTime analyzedAt = LocalDateTime.of(2026, 7, 20, 14, 35, 12);
        Deepmodel latest = analysis(2L, analyzedAt, "ACNE", 1, "/uploads/latest.jpg");

        when(deepRepository.findByDtypeUserIdOrderByDtypeDateDescDtypeCodeAsc(USER_ID))
                .thenReturn(List.of(latest));

        assertEquals(analyzedAt, deepService.getLatestPredictionAt(USER_ID));
    }

    @Test
    void latestResultDoesNotMixAnEarlierAnalysisFromTheSameDay() {
        LocalDateTime earlierAt = LocalDateTime.of(2026, 7, 20, 9, 0);
        LocalDateTime latestAt = LocalDateTime.of(2026, 7, 20, 14, 0);
        Deepmodel latestAcne = analysis(2L, latestAt, "ACNE", 2, "/uploads/latest.jpg");
        Deepmodel latestAtopy = analysis(3L, latestAt, "ATOPY", 1, "/uploads/latest.jpg");
        Deepmodel earlier = analysis(1L, earlierAt, "BLACKHEAD", 5, "/uploads/earlier.jpg");

        when(deepRepository.findByDtypeUserIdOrderByDtypeDateDescDtypeCodeAsc(USER_ID))
                .thenReturn(List.of(latestAcne, latestAtopy, earlier));

        DeepService.TodayPredictResult result = deepService.getLatestPredictDetail(USER_ID);

        assertEquals("/uploads/latest.jpg", result.getImgPath());
        assertEquals(2, result.getDetections().size());
        assertEquals("ACNE", result.getDetections().get(0).getDtype_result());
        assertEquals("ATOPY", result.getDetections().get(1).getDtype_result());
    }

    private Deepmodel analysis(
            Long code,
            LocalDateTime analyzedAt,
            String result,
            int count,
            String imagePath) {
        Deepmodel deepmodel = new Deepmodel();
        deepmodel.setDtypeCode(code);
        deepmodel.setDtypeUserId(USER_ID);
        deepmodel.setDtypeDate(analyzedAt);
        deepmodel.setDtypeResult(result);
        deepmodel.setDtypeCnt(count);
        deepmodel.setDtypeImg(imagePath);
        return deepmodel;
    }
}
