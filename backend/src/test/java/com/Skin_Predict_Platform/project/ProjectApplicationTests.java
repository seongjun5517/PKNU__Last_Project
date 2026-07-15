package com.Skin_Predict_Platform.project;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.TimeZone;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import com.Skin_Predict_Platform.project.config.TimeZoneConfig;

@SpringBootTest(properties = "app.security.migrate-legacy-passwords=false")
class ProjectApplicationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void contextLoads() {
	}

	@Test
	void usesAsiaSeoulAsApplicationTimeZone() {
		assertEquals(TimeZoneConfig.APPLICATION_TIME_ZONE, TimeZone.getDefault().getID());
	}

	@Test
	void usesKoreaTimeForDatabaseSession() {
		String databaseTimeZone = jdbcTemplate.queryForObject(
				"SELECT @@session.time_zone",
				String.class);

		assertEquals("+09:00", databaseTimeZone);
	}

}
