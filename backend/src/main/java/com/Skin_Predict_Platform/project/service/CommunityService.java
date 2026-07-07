package com.Skin_Predict_Platform.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.model.CommunityCategory;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.repository.CommunityCategoryRepository;
import com.Skin_Predict_Platform.project.repository.PostDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostDetailRepository postDetailRepository;
    private final CommunityCategoryRepository communityCategoryRepository;

    public List<PostDetail> getPostList() {
        return postDetailRepository.findAllByOrderByPostCodeDesc();
    }

    public List<CommunityCategory> getCategoryList() {
        return communityCategoryRepository.findAll();
    }

    public PostDetail getPost(Long postCode) {
        return postDetailRepository.findById(postCode).orElse(null);
    }

    public PostDetail createPost(CommunityPostCreateRequest request) {
        if (!StringUtils.hasText(request.getPostUserId())) {
            throw new IllegalArgumentException("사용자 아이디가 필요합니다.");
        }
        if (request.getCategoryCode() == null) {
            throw new IllegalArgumentException("카테고리를 선택해주세요.");
        }
        if (!communityCategoryRepository.existsById(request.getCategoryCode())) {
            throw new IllegalArgumentException("존재하지 않는 카테고리입니다.");
        }
        if (!StringUtils.hasText(request.getPostTitle())) {
            throw new IllegalArgumentException("게시글 제목을 입력해주세요.");
        }

        PostDetail post = PostDetail.builder()
                .postUserId(request.getPostUserId())
                .categoryCode(request.getCategoryCode())
                .postTitle(request.getPostTitle().trim())
                .postContent(request.getPostContent())
                .build();

        return postDetailRepository.save(post);
    }
}
