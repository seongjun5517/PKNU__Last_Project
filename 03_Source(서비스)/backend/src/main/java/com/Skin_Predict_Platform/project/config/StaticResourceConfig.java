package com.Skin_Predict_Platform.project.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// UserController 의 uploadDir 과 반드시 같은 경로를 바라봐야 함
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.profile-image-dir:../../../database/my_img}")
    private String profileImageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path dirPath = Paths.get(profileImageDir).toAbsolutePath().normalize();
        String location = "file:" + dirPath.toString() + "/";

        // http://localhost:8080/images/profile/파일명.jpg 로 접근 가능해짐
        registry.addResourceHandler("/images/profile/**")
                .addResourceLocations(location);
    }
}