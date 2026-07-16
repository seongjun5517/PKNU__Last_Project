package com.Skin_Predict_Platform.project.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import jakarta.servlet.http.Cookie;

import com.jayway.jsonpath.JsonPath;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = SecurityConfigAuthorizationTest.TestConfiguration.class)
@WebAppConfiguration
class SecurityConfigAuthorizationTest {

    @Autowired
    private WebApplicationContext applicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void privateApiRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/calendar"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void authenticatedUserCanReachPrivateApi() throws Exception {
        mockMvc.perform(get("/calendar").with(user("idor-user-a").roles("USER")))
                .andExpect(status().isOk());
    }

    @Test
    void csrfEndpointIsPublicAndIssuesCookie() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(cookie().httpOnly("XSRF-TOKEN", false))
                .andExpect(cookie().path("XSRF-TOKEN", "/"))
                .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
                .andExpect(jsonPath("$.parameterName").value("_csrf"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        Cookie rawCookie = result.getResponse().getCookie("XSRF-TOKEN");
        String maskedToken = JsonPath.read(result.getResponse().getContentAsString(), "$.token");
        assertNotNull(rawCookie);
        assertNotEquals(rawCookie.getValue(), maskedToken);
    }

    @Test
    void loginWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("user_id", "idor-user-a")
                        .param("user_pwd", "Password1!"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("ACCESS_DENIED"));
    }

    @Test
    void formLoginCreatesServerSessionUsedByFollowingRequest() throws Exception {
        Cookie csrfCookie = issueCsrfToken(null).cookie();

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue())
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("user_id", "idor-user-a")
                        .param("user_pwd", "Password1!"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("LOGIN_SUCCESS"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        mockMvc.perform(get("/calendar").session(session))
                .andExpect(status().isOk());
    }

    @Test
    void authenticatedMutationWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/calendar").with(user("idor-user-a").roles("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("ACCESS_DENIED"));
    }

    @Test
    void authenticatedMutationWithCookieCsrfTokenIsAllowed() throws Exception {
        Cookie csrfCookie = issueCsrfToken(null).cookie();

        mockMvc.perform(post("/calendar")
                        .with(user("idor-user-a").roles("USER"))
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue()))
                .andExpect(status().isOk());
    }

    @Test
    void maskedJsonTokenCannotReplaceRawCookieTokenHeader() throws Exception {
        IssuedCsrfToken csrf = issueCsrfToken(null);

        mockMvc.perform(post("/calendar")
                        .with(user("idor-user-a").roles("USER"))
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.maskedToken()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("ACCESS_DENIED"));
    }

    @Test
    void failedLoginKeepsRawTokenUsableForRetry() throws Exception {
        Cookie csrfCookie = issueCsrfToken(null).cookie();

        MvcResult failedLogin = mockMvc.perform(post("/api/auth/login")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue())
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("user_id", "idor-user-a")
                        .param("user_pwd", "wrong-password"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("INVALID_CREDENTIALS"))
                .andReturn();

        assertNull(failedLogin.getResponse().getCookie("XSRF-TOKEN"));

        mockMvc.perform(post("/api/auth/login")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue())
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("user_id", "idor-user-a")
                        .param("user_pwd", "Password1!"))
                .andExpect(status().isOk());
    }

    @Test
    void loginAndLogoutRotateBrowserCsrfCookie() throws Exception {
        Cookie loginCsrfCookie = issueCsrfToken(null).cookie();
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .cookie(loginCsrfCookie)
                        .header("X-XSRF-TOKEN", loginCsrfCookie.getValue())
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("user_id", "idor-user-a")
                        .param("user_pwd", "Password1!"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie clearedAfterLogin = login.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(clearedAfterLogin);
        assertEquals(0, clearedAfterLogin.getMaxAge());
        assertEquals("", clearedAfterLogin.getValue());
        assertEquals("/", clearedAfterLogin.getPath());

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        Cookie refreshedCsrfCookie = issueCsrfToken(session).cookie();
        assertNotEquals(loginCsrfCookie.getValue(), refreshedCsrfCookie.getValue());

        mockMvc.perform(post("/api/auth/logout")
                        .session(session)
                        .cookie(refreshedCsrfCookie))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/calendar").session(session))
                .andExpect(status().isOk());

        MvcResult logout = mockMvc.perform(post("/api/auth/logout")
                        .session(session)
                        .cookie(refreshedCsrfCookie)
                        .header("X-XSRF-TOKEN", refreshedCsrfCookie.getValue()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("LOGOUT_SUCCESS"))
                .andReturn();

        Cookie clearedAfterLogout = logout.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(clearedAfterLogout);
        assertEquals(0, clearedAfterLogout.getMaxAge());
        assertEquals("", clearedAfterLogout.getValue());
        assertEquals("/", clearedAfterLogout.getPath());

        Cookie anonymousCsrfCookie = issueCsrfToken(null).cookie();
        assertNotEquals(refreshedCsrfCookie.getValue(), anonymousCsrfCookie.getValue());
    }

    @Test
    void publicSignupPostStillRequiresCsrfToken() throws Exception {
        mockMvc.perform(post("/user/insert"))
                .andExpect(status().isForbidden());

        Cookie csrfCookie = issueCsrfToken(null).cookie();
        mockMvc.perform(post("/user/insert")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue()))
                .andExpect(status().isOk());
    }

    @Test
    void multipartUploadUsesCsrfHeaderBeforeController() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image", "profile.png", MediaType.IMAGE_PNG_VALUE, new byte[] { 1, 2, 3 });

        mockMvc.perform(multipart("/user/me/profile-image")
                        .file(image)
                        .with(user("idor-user-a").roles("USER")))
                .andExpect(status().isForbidden());

        Cookie csrfCookie = issueCsrfToken(null).cookie();
        mockMvc.perform(multipart("/user/me/profile-image")
                        .file(image)
                        .with(user("idor-user-a").roles("USER"))
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", csrfCookie.getValue()))
                .andExpect(status().isOk());
    }

    @Test
    void intendedCommunityReadRemainsPublic() throws Exception {
        mockMvc.perform(get("/community/posts"))
                .andExpect(status().isOk());
    }

    @Test
    void normalUserCannotReachAdminApi() throws Exception {
        mockMvc.perform(get("/api/admin/users").with(user("idor-user-a").roles("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("ACCESS_DENIED"));
    }

    private IssuedCsrfToken issueCsrfToken(MockHttpSession session) throws Exception {
        var request = get("/api/auth/csrf");
        if (session != null) {
            request.session(session);
        }

        MvcResult result = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andReturn();
        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        String maskedToken = JsonPath.read(result.getResponse().getContentAsString(), "$.token");
        return new IssuedCsrfToken(cookie, maskedToken);
    }

    private record IssuedCsrfToken(Cookie cookie, String maskedToken) {
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import(SecurityConfig.class)
    static class TestConfiguration {
        @Bean
        TestController testController() {
            return new TestController();
        }

        @Bean
        UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
            return new InMemoryUserDetailsManager(
                    User.withUsername("idor-user-a")
                            .password(passwordEncoder.encode("Password1!"))
                            .roles("USER")
                            .build(),
                    User.withUsername("idor-user-b")
                            .password(passwordEncoder.encode("Password2!"))
                            .roles("USER")
                            .build());
        }
    }

    @RestController
    static class TestController {
        @GetMapping("/api/auth/csrf")
        CsrfToken csrf(CsrfToken csrfToken) {
            return csrfToken;
        }

        @GetMapping("/calendar")
        String calendar() {
            return "private";
        }

        @PostMapping("/calendar")
        String createCalendar() {
            return "created";
        }

        @PostMapping("/user/insert")
        String signup() {
            return "signed-up";
        }

        @PostMapping(path = "/user/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        String uploadProfileImage(@RequestParam("image") MultipartFile image) {
            return image.isEmpty() ? "empty" : "uploaded";
        }

        @GetMapping("/community/posts")
        String communityPosts() {
            return "public";
        }

        @GetMapping("/api/admin/users")
        String adminUsers() {
            return "admin";
        }
    }
}
