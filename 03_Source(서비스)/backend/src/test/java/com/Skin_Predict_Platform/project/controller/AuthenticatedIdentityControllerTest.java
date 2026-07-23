package com.Skin_Predict_Platform.project.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import com.Skin_Predict_Platform.project.dto.CalendarRequest;
import com.Skin_Predict_Platform.project.model.Calendar;
import com.Skin_Predict_Platform.project.service.CalService;
import com.Skin_Predict_Platform.project.service.CommunityService;
import com.Skin_Predict_Platform.project.service.DeepService;

class AuthenticatedIdentityControllerTest {

    private static final String USER_A = "idor-user-a";
    private static final String USER_B = "idor-user-b";

    @Test
    void calendarInsertIgnoresMaliciousBodyUserAndUsesAuthenticatedPrincipal() throws Exception {
        CalService calService = mock(CalService.class);
        CalendarController controller = new CalendarController(calService);
        MockMvc mockMvc = standaloneSetup(controller).build();
        Authentication authentication = authenticatedUserA();

        when(calService.insertCalendar(eq(USER_A), any(CalendarRequest.class)))
                .thenReturn(Calendar.builder()
                        .calCode(600L)
                        .calUserId(USER_A)
                        .calTitle("safe task")
                        .build());

        mockMvc.perform(post("/calendar")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "idor-user-b",
                                  "calUserId": "idor-user-b",
                                  "calTitle": "safe task"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calUserId").value(USER_A));

        verify(calService).insertCalendar(eq(USER_A), any(CalendarRequest.class));
        verify(calService, never()).insertCalendar(eq(USER_B), any(CalendarRequest.class));
    }

    @Test
    void deepDeleteUsesAuthenticatedPrincipalForOwnershipLookup() throws Exception {
        DeepService deepService = mock(DeepService.class);
        DeepController controller = new DeepController(deepService);
        MockMvc mockMvc = standaloneSetup(controller).build();

        when(deepService.deleteDeepmodel(601L, USER_A)).thenReturn(false);

        mockMvc.perform(delete("/deep/601").principal(authenticatedUserA()))
                .andExpect(status().isNotFound());

        verify(deepService).deleteDeepmodel(601L, USER_A);
        verify(deepService, never()).deleteDeepmodel(601L, USER_B);
    }

    @Test
    void communityDeleteUsesAuthenticatedPrincipalInsteadOfRequestUserId() throws Exception {
        CommunityService communityService = mock(CommunityService.class);
        CommunityController controller = new CommunityController(communityService);
        MockMvc mockMvc = standaloneSetup(controller).build();

        when(communityService.deletePost(602L, USER_A)).thenReturn(false);

        mockMvc.perform(delete("/community/posts/602")
                        .principal(authenticatedUserA())
                        .queryParam("userId", USER_B))
                .andExpect(status().isForbidden());

        verify(communityService).deletePost(602L, USER_A);
        verify(communityService, never()).deletePost(602L, USER_B);
    }

    private Authentication authenticatedUserA() {
        return new TestingAuthenticationToken(USER_A, null, List.of());
    }
}
