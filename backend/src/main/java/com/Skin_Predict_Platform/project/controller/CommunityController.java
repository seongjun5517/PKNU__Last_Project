package com.Skin_Predict_Platform.project.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.Skin_Predict_Platform.project.dto.CommunityPostCreateRequest;
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

    @PostMapping("/posts")
    public PostDetail createPost(@RequestBody CommunityPostCreateRequest request) {
        return communityService.createPost(request);
    }
}
