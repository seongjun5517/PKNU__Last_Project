package com.Skin_Predict_Platform.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Skin_Predict_Platform.project.model.CommunityComment;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    @Query("""
            SELECT comment
            FROM CommunityComment comment
            WHERE comment.cmtPostCode = :postCode
            ORDER BY comment.cmtCreatedAt ASC, comment.cmtCode ASC
            """)
    List<CommunityComment> findByPostCode(@Param("postCode") Long postCode);

    @Query("""
            SELECT comment
            FROM CommunityComment comment
            WHERE comment.cmtUserId = :userId
            ORDER BY comment.cmtCreatedAt DESC, comment.cmtCode DESC
            """)
    List<CommunityComment> findByUserId(@Param("userId") String userId);
}
