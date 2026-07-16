package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Skin_Predict_Platform.project.model.Deepmodel;
import com.Skin_Predict_Platform.project.repository.DeepRepository;

@ExtendWith(MockitoExtension.class)
class DeepServiceIdorTest {

    private static final String USER_A = "idor-user-a";
    private static final String USER_B = "idor-user-b";
    private static final long USER_B_ANALYSIS_CODE = 300L;

    @Mock
    private DeepRepository deepRepository;

    @InjectMocks
    private DeepService deepService;

    @Test
    void userACannotReadOrDeleteUserBSingleAnalysis() {
        Deepmodel userBAnalysis = new Deepmodel();
        userBAnalysis.setDtypeCode(USER_B_ANALYSIS_CODE);
        userBAnalysis.setDtypeUserId(USER_B);
        userBAnalysis.setDtypeResult("ACNE");

        when(deepRepository.findByDtypeCodeAndDtypeUserId(USER_B_ANALYSIS_CODE, USER_A))
                .thenReturn(Optional.empty());

        assertNull(deepService.getDeepmodel(USER_B_ANALYSIS_CODE, USER_A));
        assertFalse(deepService.deleteDeepmodel(USER_B_ANALYSIS_CODE, USER_A));

        verify(deepRepository, times(2))
                .findByDtypeCodeAndDtypeUserId(USER_B_ANALYSIS_CODE, USER_A);
        verify(deepRepository, never()).findById(USER_B_ANALYSIS_CODE);
        verify(deepRepository, never()).delete(any(Deepmodel.class));
        verify(deepRepository, never()).deleteById(USER_B_ANALYSIS_CODE);
    }

    @Test
    void ownerCanDeleteOwnSingleAnalysis() {
        Deepmodel userAAnalysis = new Deepmodel();
        userAAnalysis.setDtypeCode(301L);
        userAAnalysis.setDtypeUserId(USER_A);

        when(deepRepository.findByDtypeCodeAndDtypeUserId(301L, USER_A))
                .thenReturn(Optional.of(userAAnalysis));

        assertTrue(deepService.deleteDeepmodel(301L, USER_A));
        verify(deepRepository).delete(userAAnalysis);
    }
}
