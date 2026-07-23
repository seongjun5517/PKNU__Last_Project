package com.Skin_Predict_Platform.project.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.Skin_Predict_Platform.project.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(
        name = "app.security.migrate-legacy-passwords",
        havingValue = "true")
public class LegacyPasswordMigration implements ApplicationRunner {

    private final UserService userService;

    @Override
    public void run(ApplicationArguments args) {
        int migratedCount = userService.migrateLegacyPasswords();
        log.info("Legacy password migration completed: migratedCount={}", migratedCount);
    }
}
