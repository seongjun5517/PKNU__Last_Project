package com.Skin_Predict_Platform.project.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.Skin_Predict_Platform.project.model.CommunityCategory;
import com.Skin_Predict_Platform.project.repository.CommunityCategoryRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CommunityDataInitializer implements CommandLineRunner {

    private final CommunityCategoryRepository communityCategoryRepository;

    @Override
    public void run(String... args) {
        if (communityCategoryRepository.count() > 0) {
            return;
        }
        // 카테고리 삽입 세팅하기
        communityCategoryRepository.saveAll(List.of(
                CommunityCategory.builder().categoryCode(1L).categoryName("자유게시판").build(),
                CommunityCategory.builder().categoryCode(2L).categoryName("다이어트").build(),
                CommunityCategory.builder().categoryCode(3L).categoryName("패션").build(),
                CommunityCategory.builder().categoryCode(4L).categoryName("피부").build(),
                CommunityCategory.builder().categoryCode(5L).categoryName("헤어").build(),
                CommunityCategory.builder().categoryCode(6L).categoryName("메이크업/화장품").build(),
                CommunityCategory.builder().categoryCode(7L).categoryName("성형").build(),
                CommunityCategory.builder().categoryCode(8L).categoryName("악세사리").build(),
                CommunityCategory.builder().categoryCode(9L).categoryName("향수").build()));
    }
}
