package com.Skin_Predict_Platform.project.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.Skin_Predict_Platform.project.dto.CommunityCommentCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityMyCommentResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostScrapResponse;
import com.Skin_Predict_Platform.project.dto.CommunityReportCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityReportResolveRequest;
import com.Skin_Predict_Platform.project.model.CommunityCategory;
import com.Skin_Predict_Platform.project.model.CommunityComment;
import com.Skin_Predict_Platform.project.model.CommunityPostLike;
import com.Skin_Predict_Platform.project.model.CommunityPostScrap;
import com.Skin_Predict_Platform.project.model.CommunityReport;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.repository.CommunityCategoryRepository;
import com.Skin_Predict_Platform.project.repository.CommunityCommentRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostLikeRepository;
import com.Skin_Predict_Platform.project.repository.CommunityPostScrapRepository;
import com.Skin_Predict_Platform.project.repository.CommunityReportRepository;
import com.Skin_Predict_Platform.project.repository.PostDetailRepository;
import com.Skin_Predict_Platform.project.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private static final Set<String> REPORT_REASONS = Set.of(
            "SPAM_ADVERTISING",
            "ABUSE_HARASSMENT",
            "HATE_DISCRIMINATION",
            "INAPPROPRIATE_CONTENT");
    private static final String REPORT_DECISION_KEEP = "KEEP";
    private static final String REPORT_DECISION_DELETE = "DELETE";

    private final PostDetailRepository postDetailRepository;
    private final CommunityCategoryRepository communityCategoryRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;
    private final CommunityPostScrapRepository communityPostScrapRepository;
    private final CommunityReportRepository communityReportRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final NoticeService noticeService;
    private final UserRepository userRepository;

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
            PostDetail savedPost = postDetailRepository.save(post);
            noticeService.createLikeNotification(savedPost, userId);
            return new CommunityPostLikeResponse(savedPost, true);
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

    @Transactional
    public PostDetail updatePost(Long postCode, CommunityPostCreateRequest request) {
        PostDetail post = postDetailRepository.findById(postCode).orElse(null);

        if (post == null) {
            return null;
        }
        if (request == null || !StringUtils.hasText(request.getPostUserId())
                || !post.getPostUserId().equals(request.getPostUserId())) {
            throw new SecurityException("게시글 작성자만 수정할 수 있습니다.");
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

        post.setCategoryCode(request.getCategoryCode());
        post.setPostTitle(request.getPostTitle().trim());
        post.setPostContent(request.getPostContent());

        return postDetailRepository.save(post);
    }

    @Transactional
    public Boolean deletePost(Long postCode, String userId) {
        PostDetail post = postDetailRepository.findById(postCode).orElse(null);

        if (post == null) {
            return null;
        }
        if (!post.getPostUserId().equals(userId) && !isSuperAdmin(userId)) {
            return false;
        }

        deletePostResources(post);
        return true;
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
        PostDetail post = postDetailRepository.findById(postCode).orElse(null);

        if (post == null) {
            return null;
        }

        CommunityComment comment = CommunityComment.builder()
                .cmtPostCode(postCode)
                .cmtUserId(request.getUserId())
                .cmtContents(request.getContents().trim())
                .build();

        CommunityComment savedComment = communityCommentRepository.save(comment);
        noticeService.createCommentNotification(post, savedComment);

        return savedComment;
    }

    @Transactional
    public CommunityReport createReport(Long postCode, CommunityReportCreateRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())
                || !StringUtils.hasText(request.getReportReason())) {
            throw new IllegalArgumentException("Report information is required.");
        }

        PostDetail post = postDetailRepository.findById(postCode).orElse(null);
        if (post == null) {
            return null;
        }
        if (!userRepository.existsById(request.getUserId())) {
            throw new IllegalArgumentException("Reporter does not exist.");
        }
        if (post.getPostUserId().equals(request.getUserId())) {
            throw new SecurityException("You cannot report your own post.");
        }
        if (!REPORT_REASONS.contains(request.getReportReason())) {
            throw new IllegalArgumentException("Invalid report reason.");
        }
        if (communityReportRepository.existsByReportPostCodeAndReportUserId(postCode, request.getUserId())) {
            throw new IllegalStateException("This post has already been reported.");
        }

        CommunityReport savedReport = communityReportRepository.save(CommunityReport.builder()
                .reportPostCode(postCode)
                .reportUserId(request.getUserId())
                .reportReason(request.getReportReason())
                .build());
        noticeService.createReportNotifications(post, savedReport);

        return savedReport;
    }

    public Long getReportCount(Long postCode, String userId) {
        if (postDetailRepository.findById(postCode).isEmpty()) {
            return null;
        }
        requireSuperAdmin(userId);
        return communityReportRepository.countByReportPostCode(postCode);
    }

    public List<CommunityReport> getReports(Long postCode, String userId) {
        if (postDetailRepository.findById(postCode).isEmpty()) {
            return null;
        }
        requireSuperAdmin(userId);
        return communityReportRepository.findByReportPostCodeOrderByReportCreatedAtDesc(postCode);
    }

    @Transactional
    public Boolean resolveReports(Long postCode, CommunityReportResolveRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())
                || !StringUtils.hasText(request.getDecision())) {
            throw new IllegalArgumentException("Resolution information is required.");
        }

        PostDetail post = postDetailRepository.findById(postCode).orElse(null);
        if (post == null) {
            return null;
        }
        requireSuperAdmin(request.getUserId());

        if (REPORT_DECISION_KEEP.equals(request.getDecision())) {
            communityReportRepository.deleteByReportPostCode(postCode);
            return true;
        }
        if (REPORT_DECISION_DELETE.equals(request.getDecision())) {
            deletePostResources(post);
            noticeService.createReportDeletionNotification(post, request.getUserId());
            return true;
        }

        throw new IllegalArgumentException("Invalid report decision.");
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
        if (!comment.getCmtUserId().equals(userId) && !isSuperAdmin(userId)) {
            return false;
        }
        noticeService.deleteByCommentCode(commentCode);
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

    private boolean isSuperAdmin(String userId) {
        if (!StringUtils.hasText(userId)) {
            return false;
        }

        return userRepository.findById(userId)
                .map((user) -> Boolean.TRUE.equals(user.getUserMan()))
                .orElse(false);
    }

    private void requireSuperAdmin(String userId) {
        if (!isSuperAdmin(userId)) {
            throw new SecurityException("Super admin access is required.");
        }
    }

    private void deletePostResources(PostDetail post) {
        Long postCode = post.getPostCode();
        communityReportRepository.deleteByReportPostCode(postCode);
        communityCommentRepository.deleteByCmtPostCode(postCode);
        communityPostLikeRepository.deleteByLikePostCode(postCode);
        communityPostScrapRepository.deleteByScrapPostCode(postCode);
        noticeService.deleteByPostCode(postCode);
        postDetailRepository.delete(post);
    }
}
