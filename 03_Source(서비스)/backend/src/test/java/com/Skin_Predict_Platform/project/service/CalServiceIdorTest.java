package com.Skin_Predict_Platform.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Skin_Predict_Platform.project.dto.CalendarRequest;
import com.Skin_Predict_Platform.project.model.Calendar;
import com.Skin_Predict_Platform.project.repository.CalRepository;

@ExtendWith(MockitoExtension.class)
class CalServiceIdorTest {

    private static final String USER_A = "idor-user-a";
    private static final String USER_B = "idor-user-b";
    private static final long USER_B_CALENDAR_CODE = 200L;

    @Mock
    private CalRepository calRepository;

    @InjectMocks
    private CalService calService;

    @Test
    void calendarRequestDoesNotAcceptAnyUserIdentityField() {
        Set<String> fieldNames = Arrays.stream(CalendarRequest.class.getDeclaredFields())
                .map(Field::getName)
                .collect(Collectors.toSet());

        assertFalse(fieldNames.contains("userId"));
        assertFalse(fieldNames.contains("calUserId"));
    }

    @Test
    void insertAlwaysAssignsAuthenticatedUserAsOwner() {
        CalendarRequest request = new CalendarRequest();
        request.setCalTitle("A's task");
        request.setCalCategory("SKINCARE");

        when(calRepository.save(any(Calendar.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Calendar saved = calService.insertCalendar(USER_A, request);

        assertEquals(USER_A, saved.getCalUserId());
        assertEquals("A's task", saved.getCalTitle());
        verify(calRepository).save(saved);
    }

    @Test
    void userACannotReadUpdateOrDeleteUserBCalendar() {
        Calendar userBCalendar = Calendar.builder()
                .calCode(USER_B_CALENDAR_CODE)
                .calUserId(USER_B)
                .calTitle("B's private task")
                .build();
        CalendarRequest update = new CalendarRequest();
        update.setCalTitle("attacker update");

        when(calRepository.findByCalCodeAndCalUserId(USER_B_CALENDAR_CODE, USER_A))
                .thenReturn(Optional.empty());

        assertNull(calService.getCalendar(USER_B_CALENDAR_CODE, USER_A));
        assertNull(calService.updateCalendar(USER_B_CALENDAR_CODE, USER_A, update));
        assertFalse(calService.deleteCalendar(USER_B_CALENDAR_CODE, USER_A));

        verify(calRepository, times(3))
                .findByCalCodeAndCalUserId(USER_B_CALENDAR_CODE, USER_A);
        verify(calRepository, never()).findById(USER_B_CALENDAR_CODE);
        verify(calRepository, never()).save(any(Calendar.class));
        verify(calRepository, never()).delete(any(Calendar.class));
        assertEquals("B's private task", userBCalendar.getCalTitle());
    }
}
