package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeRequest;
import com.Skin_Predict_Platform.project.dto.CommunityPostLikeResponse;
import com.Skin_Predict_Platform.project.model.CommunityCategory;
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

    @PostMapping("/posts")
    public PostDetail createPost(@RequestBody CommunityPostCreateRequest request) {
        return communityService.createPost(request);
    }
}
