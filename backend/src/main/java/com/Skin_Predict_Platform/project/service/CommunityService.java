package com.Skin_Predict_Platform.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeResponse;
import com.Skin_Predict_Platform.project.model.CommunityCategory;
import com.Skin_Predict_Platform.project.model.CommunityPostLike;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.repository.CommunityCategoryRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostLikeRepository;
import com.Skin_Predict_Platform.project.repository.PostDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostDetailRepository postDetailRepository;
    private final CommunityCategoryRepository communityCategoryRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;

    public List<PostDetail> getPostList() {
        return postDetailRepository.findAllByOrderByPostCodeDesc();
    }

    public List<CommunityCategory> getCategoryList() {
        return communityCategoryRepository.findAll();
    }

    public PostDetail getPost(Long postCode) {
        return postDetailRepository.findById(postCode).orElse(null);
    }
    // 조아요 ~
    @Transactional
    public CommunityPostLikeResponse togglePostLike(Long postCode, String userId) {
        PostDetail post = postDetailRepository.findById(postCode).orElse(null);

        if (post == null) {
            return null;
        }

        int currentLikeCount = post.getPostLike() == null ? 0 : post.getPostLike();
        CommunityPostLike existingLike = communityPostLikeRepository
                .findByLikePostCodeAndLikeUserId(postCode, userId)
                .orElse(null);

        if (existingLike == null) {
            communityPostLikeRepository.save(CommunityPostLike.builder()
                    .likePostCode(postCode)
                    .likeUserId(userId)
                    .build());
            post.setPostLike(currentLikeCount + 1);

            return new CommunityPostLikeResponse(postDetailRepository.save(post), true);
        }

        communityPostLikeRepository.delete(existingLike);
        post.setPostLike(Math.max(currentLikeCount - 1, 0));

        return new CommunityPostLikeResponse(postDetailRepository.save(post), false);
    }
    // 좋아요 눌렀던
    public boolean hasLikedPost(Long postCode, String userId) {
        return communityPostLikeRepository.existsByLikePostCodeAndLikeUserId(postCode, userId);
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
