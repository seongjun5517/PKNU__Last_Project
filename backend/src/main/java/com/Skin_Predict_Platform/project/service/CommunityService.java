package com.Skin_Predict_Platform.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.Skin_Predict_Platform.project.dto.CommunityCommentCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityMyCommentResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostScrapResponse;
import com.Skin_Predict_Platform.project.model.CommunityCategory;
import com.Skin_Predict_Platform.project.model.CommunityComment;
import com.Skin_Predict_Platform.project.model.CommunityPostLike;
import com.Skin_Predict_Platform.project.model.CommunityPostScrap;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.repository.CommunityCategoryRepository;
import com.Skin_Predict_Platform.project.repository.CommunityCommentRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostLikeRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostScrapRepository;
import com.Skin_Predict_Platform.project.repository.PostDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostDetailRepository postDetailRepository;
    private final CommunityCategoryRepository communityCategoryRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;
    private final CommunityPostScrapRepository communityPostScrapRepository;
    private final CommunityCommentRepository communityCommentRepository;

    public List<PostDetail> getPostList() {
        return postDetailRepository.findAllByOrderByPostCodeDesc();
    }

    public List<CommunityCategory> getCategoryList() {
        return communityCategoryRepository.findAll();
    }

    public PostDetail getPost(Long postCode) {
        return postDetailRepository.findById(postCode).orElse(null);
    }

    @Transactional
    public PostDetail increasePostView(Long postCode, String viewerUserId) {
        PostDetail post = postDetailRepository.findById(postCode).orElse(null);

        if (post == null) {
            return null;
        }

        if (StringUtils.hasText(viewerUserId) && !viewerUserId.equals(post.getPostUserId())) {
            int currentViews = post.getPostViews() == null ? 0 : post.getPostViews();
            post.setPostViews(currentViews + 1);
            return postDetailRepository.save(post);
        }

        return post;
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
            // 생성자 생성
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

    @Transactional
    public CommunityPostScrapResponse togglePostScrap(Long postCode, String userId) {
        PostDetail post = postDetailRepository.findById(postCode).orElse(null);

        if (post == null) {
            return null;
        }

        int currentScrapCount = post.getPostScrap() == null ? 0 : post.getPostScrap();
        CommunityPostScrap existingScrap = communityPostScrapRepository
                .findByScrapPostCodeAndScrapUserId(postCode, userId)
                .orElse(null);

        if (existingScrap == null) {
            communityPostScrapRepository.save(CommunityPostScrap.builder()
                    .scrapPostCode(postCode)
                    .scrapUserId(userId)
                    .build());
            post.setPostScrap(currentScrapCount + 1);
            return new CommunityPostScrapResponse(postDetailRepository.save(post), true);
        }

        communityPostScrapRepository.delete(existingScrap);
        post.setPostScrap(Math.max(currentScrapCount - 1, 0));

        return new CommunityPostScrapResponse(postDetailRepository.save(post), false);
    }

    public boolean hasScrappedPost(Long postCode, String userId) {
        return communityPostScrapRepository.existsByScrapPostCodeAndScrapUserId(postCode, userId);
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

    public List<CommunityComment> getPostComments(Long postCode) {
        return communityCommentRepository.findByPostCode(postCode);
    }

    @Transactional
    public CommunityComment createComment(Long postCode, CommunityCommentCreateRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())
                || !StringUtils.hasText(request.getContents())) {
            throw new IllegalArgumentException("댓글 작성 정보가 필요합니다.");
        }
        if (!postDetailRepository.existsById(postCode)) {
            return null;
        }

        CommunityComment comment = CommunityComment.builder()
                .cmtPostCode(postCode)
                .cmtUserId(request.getUserId())
                .cmtContents(request.getContents().trim())
                .build();

        return communityCommentRepository.save(comment);
    }

    public List<CommunityMyCommentResponse> getMyComments(String userId) {
        return communityCommentRepository.findByUserId(userId)
                .stream()
                .map((comment) -> new CommunityMyCommentResponse(
                        comment.getCmtCode(),
                        comment.getCmtPostCode(),
                        postDetailRepository.findById(comment.getCmtPostCode())
                                .map(PostDetail::getPostTitle)
                                .orElse("삭제된 게시글"),
                        comment.getCmtContents(),
                        comment.getCmtCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public Boolean deleteComment(Long commentCode, String userId) {
        CommunityComment comment = communityCommentRepository.findById(commentCode).orElse(null);

        if (comment == null) {
            return null;
        }
        if (!comment.getCmtUserId().equals(userId)) {
            return false;
        }

        communityCommentRepository.delete(comment);
        return true;
    }

    public List<PostDetail> getMyPosts(String userId) {
        return postDetailRepository.findByPostUserIdOrderByPostCodeDesc(userId);
        }

    public List<PostDetail> getLikedPosts(String userId) {
        List<Long> postCodes = communityPostLikeRepository.findByLikeUserId(userId)
                .stream()
                .map(CommunityPostLike::getLikePostCode)
                .toList();
        return postDetailRepository.findByPostCodeInOrderByPostCodeDesc(postCodes);
    }

    public List<PostDetail> getScrappedPosts(String userId) {
        List<Long> postCodes = communityPostScrapRepository.findByScrapUserId(userId)
                .stream()
                .map(CommunityPostScrap::getScrapPostCode)
                .toList();
        return postDetailRepository.findByPostCodeInOrderByPostCodeDesc(postCodes);
    }
}
