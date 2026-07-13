package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.CommunityCommentCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityMyCommentResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostScrapResponse;
import com.Skin_Predict_Platform.project.dto.CommunityReportCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityReportResolveRequest;
import com.Skin_Predict_Platform.project.model.CommunityCategory;
import com.Skin_Predict_Platform.project.model.CommunityComment;
import com.Skin_Predict_Platform.project.model.CommunityReport;
import com.Skin_Predict_Platform.project.model.PostDetail;
import com.Skin_Predict_Platform.project.service.CommunityService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/categories")
    public List<CommunityCategory> getCategoryList() {
        return communityService.getCategoryList();
    }

    @GetMapping("/posts")
    public List<PostDetail> getPostList() {
        return communityService.getPostList();
    }

    @GetMapping("/posts/{postCode}")
    public ResponseEntity<PostDetail> getPost(@PathVariable Long postCode) {
        PostDetail post = communityService.getPost(postCode);

        if (post == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{postCode}/view")
    public ResponseEntity<PostDetail> increasePostView(
            @PathVariable Long postCode,
            @RequestBody CommunityPostLikeRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())) {
            return ResponseEntity.badRequest().build();
        }

        PostDetail post = communityService.increasePostView(postCode, request.getUserId());

        if (post == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{postCode}/like")
    public ResponseEntity<CommunityPostLikeResponse> togglePostLike(
            @PathVariable Long postCode,
            @RequestBody CommunityPostLikeRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())) {
            return ResponseEntity.badRequest().build();
        }

        CommunityPostLikeResponse response = communityService.togglePostLike(postCode, request.getUserId());

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postCode}/like")
    public ResponseEntity<Boolean> hasLikedPost(
            @PathVariable Long postCode,
            @RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(communityService.hasLikedPost(postCode, userId));
    }

    @PostMapping("/posts/{postCode}/scrap")
    public ResponseEntity<CommunityPostScrapResponse> togglePostScrap(
            @PathVariable Long postCode,
            @RequestBody CommunityPostLikeRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())) {
            return ResponseEntity.badRequest().build();
        }

        CommunityPostScrapResponse response = communityService.togglePostScrap(postCode, request.getUserId());

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postCode}/scrap")
    public ResponseEntity<Boolean> hasScrappedPost(
            @PathVariable Long postCode,
            @RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(communityService.hasScrappedPost(postCode, userId));
    }

    @PostMapping("/posts")
    public PostDetail createPost(@RequestBody CommunityPostCreateRequest request) {
        return communityService.createPost(request);
    }

    @PutMapping("/posts/{postCode}")
    public ResponseEntity<PostDetail> updatePost(
            @PathVariable Long postCode,
            @RequestBody CommunityPostCreateRequest request) {
        try {
            PostDetail updated = communityService.updatePost(postCode, request);

            if (updated == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updated);
        } catch (SecurityException error) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/posts/{postCode}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postCode,
            @RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        Boolean deleted = communityService.deletePost(postCode, userId);

        if (deleted == null) {
            return ResponseEntity.notFound().build();
        }
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts/{postCode}/comments")
    public List<CommunityComment> getPostComments(@PathVariable Long postCode) {
        return communityService.getPostComments(postCode);
    }

    @PostMapping("/posts/{postCode}/comments")
    public ResponseEntity<CommunityComment> createComment(
            @PathVariable Long postCode,
            @RequestBody CommunityCommentCreateRequest request) {
        if (request == null || !StringUtils.hasText(request.getUserId())
                || !StringUtils.hasText(request.getContents())) {
            return ResponseEntity.badRequest().build();
        }

        CommunityComment comment = communityService.createComment(postCode, request);

        if (comment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(comment);
    }

    @PostMapping("/posts/{postCode}/reports")
    public ResponseEntity<CommunityReport> createReport(
            @PathVariable Long postCode,
            @RequestBody CommunityReportCreateRequest request) {
        try {
            CommunityReport report = communityService.createReport(postCode, request);

            if (report == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(report);
        } catch (SecurityException error) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException error) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/{postCode}/reports/count")
    public ResponseEntity<java.util.Map<String, Long>> getReportCount(
            @PathVariable Long postCode,
            @RequestParam String userId) {
        try {
            Long count = communityService.getReportCount(postCode, userId);
            if (count == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(java.util.Map.of("count", count));
        } catch (SecurityException error) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/posts/{postCode}/reports")
    public ResponseEntity<List<CommunityReport>> getReports(
            @PathVariable Long postCode,
            @RequestParam String userId) {
        try {
            List<CommunityReport> reports = communityService.getReports(postCode, userId);
            if (reports == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(reports);
        } catch (SecurityException error) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/posts/{postCode}/reports/resolve")
    public ResponseEntity<Void> resolveReports(
            @PathVariable Long postCode,
            @RequestBody CommunityReportResolveRequest request) {
        try {
            Boolean resolved = communityService.resolveReports(postCode, request);
            if (resolved == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.noContent().build();
        } catch (SecurityException error) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/mine/{userId}")
    public List<PostDetail> getMyPosts(@PathVariable String userId) {
        return communityService.getMyPosts(userId);
    }

    @GetMapping("/posts/liked/{userId}")
    public List<PostDetail> getLikedPosts(@PathVariable String userId) {
        return communityService.getLikedPosts(userId);
    }

    @GetMapping("/posts/scrapped/{userId}")
    public List<PostDetail> getScrappedPosts(@PathVariable String userId) {
        return communityService.getScrappedPosts(userId);
    }

    @GetMapping("/comments/mine/{userId}")
    public List<CommunityMyCommentResponse> getMyComments(@PathVariable String userId) {
        return communityService.getMyComments(userId);
    }

    @DeleteMapping("/comments/{commentCode}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentCode,
            @RequestParam String userId) {
        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().build();
        }

        Boolean deleted = communityService.deleteComment(commentCode, userId);

        if (deleted == null) {
            return ResponseEntity.notFound().build();
        }
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.noContent().build();
    }
}
