package com.Skin_Predict_Platform.project.config;

import java.util.TimeZone;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class TimeZoneConfig {

    public static final String APPLICATION_TIME_ZONE = "Asia/Seoul";

    @PostConstruct
    public void configureDefaultTimeZone() {
        TimeZone.setDefault(TimeZone.getTimeZone(APPLICATION_TIME_ZONE));
    }
}
