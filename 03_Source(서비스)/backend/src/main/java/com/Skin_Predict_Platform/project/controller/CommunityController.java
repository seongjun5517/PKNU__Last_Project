package com.Skin_Predict_Platform.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.CommunityCommentCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityCommentUpdateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityMyCommentResponse;
import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
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
        return post == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{postCode}/view")
    public ResponseEntity<PostDetail> increasePostView(
            Authentication authentication,
            @PathVariable Long postCode) {
        PostDetail post = communityService.increasePostView(postCode, authentication.getName());
        return post == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(post);
    }

    @PostMapping("/posts/{postCode}/like")
    public ResponseEntity<CommunityPostLikeResponse> togglePostLike(
            Authentication authentication,
            @PathVariable Long postCode) {
        CommunityPostLikeResponse response =
                communityService.togglePostLike(postCode, authentication.getName());
        return response == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postCode}/like")
    public boolean hasLikedPost(Authentication authentication, @PathVariable Long postCode) {
        return communityService.hasLikedPost(postCode, authentication.getName());
    }

    @PostMapping("/posts/{postCode}/scrap")
    public ResponseEntity<CommunityPostScrapResponse> togglePostScrap(
            Authentication authentication,
            @PathVariable Long postCode) {
        CommunityPostScrapResponse response =
                communityService.togglePostScrap(postCode, authentication.getName());
        return response == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postCode}/scrap")
    public boolean hasScrappedPost(Authentication authentication, @PathVariable Long postCode) {
        return communityService.hasScrappedPost(postCode, authentication.getName());
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            Authentication authentication,
            @RequestBody CommunityPostCreateRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(communityService.createPost(authentication.getName(), request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @PutMapping("/posts/{postCode}")
    public ResponseEntity<PostDetail> updatePost(
            Authentication authentication,
            @PathVariable Long postCode,
            @RequestBody CommunityPostCreateRequest request) {
        try {
            PostDetail updated = communityService.updatePost(
                    postCode, authentication.getName(), request);
            return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/posts/{postCode}")
    public ResponseEntity<Void> deletePost(
            Authentication authentication,
            @PathVariable Long postCode) {
        Boolean deleted = communityService.deletePost(postCode, authentication.getName());
        if (deleted == null) {
            return ResponseEntity.notFound().build();
        }
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/posts/{postCode}/comments")
    public List<CommunityComment> getPostComments(@PathVariable Long postCode) {
        return communityService.getPostComments(postCode);
    }

    @PostMapping("/posts/{postCode}/comments")
    public ResponseEntity<?> createComment(
            Authentication authentication,
            @PathVariable Long postCode,
            @RequestBody CommunityCommentCreateRequest request) {
        if (request == null || !StringUtils.hasText(request.getContents())) {
            return ResponseEntity.badRequest().build();
        }
        CommunityComment comment = communityService.createComment(
                postCode, authentication.getName(), request);
        return comment == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(comment);
    }

    @PutMapping("/comments/{commentCode}")
    public ResponseEntity<CommunityComment> updateComment(
            Authentication authentication,
            @PathVariable Long commentCode,
            @RequestBody CommunityCommentUpdateRequest request) {
        try {
            CommunityComment comment = communityService.updateComment(
                    commentCode, authentication.getName(), request);
            return comment == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(comment);
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/comments/{commentCode}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long commentCode) {
        Boolean deleted = communityService.deleteComment(commentCode, authentication.getName());
        if (deleted == null) {
            return ResponseEntity.notFound().build();
        }
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/posts/{postCode}/reports")
    public ResponseEntity<CommunityReport> createReport(
            Authentication authentication,
            @PathVariable Long postCode,
            @RequestBody CommunityReportCreateRequest request) {
        try {
            CommunityReport report = communityService.createReport(
                    postCode, authentication.getName(), request);
            return report == null
                    ? ResponseEntity.notFound().build()
                    : ResponseEntity.status(HttpStatus.CREATED).body(report);
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/{postCode}/reports/count")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Long>> getReportCount(
            Authentication authentication,
            @PathVariable Long postCode) {
        Long count = communityService.getReportCount(postCode, authentication.getName());
        return count == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/posts/{postCode}/reports")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<CommunityReport>> getReports(
            Authentication authentication,
            @PathVariable Long postCode) {
        List<CommunityReport> reports = communityService.getReports(postCode, authentication.getName());
        return reports == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(reports);
    }

    @PostMapping("/posts/{postCode}/reports/resolve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> resolveReports(
            Authentication authentication,
            @PathVariable Long postCode,
            @RequestBody CommunityReportResolveRequest request) {
        try {
            Boolean resolved = communityService.resolveReports(
                    postCode, authentication.getName(), request);
            return resolved == null
                    ? ResponseEntity.notFound().build()
                    : ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/mine")
    public List<PostDetail> getMyPosts(Authentication authentication) {
        return communityService.getMyPosts(authentication.getName());
    }

    @GetMapping("/posts/liked")
    public List<PostDetail> getLikedPosts(Authentication authentication) {
        return communityService.getLikedPosts(authentication.getName());
    }

    @GetMapping("/posts/scrapped")
    public List<PostDetail> getScrappedPosts(Authentication authentication) {
        return communityService.getScrappedPosts(authentication.getName());
    }

    @GetMapping("/comments/mine")
    public List<CommunityMyCommentResponse> getMyComments(Authentication authentication) {
        return communityService.getMyComments(authentication.getName());
    }
}
