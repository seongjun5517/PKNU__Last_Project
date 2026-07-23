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

    // 게시글별 댓글 수 한 번에 집계 (목록 조회용)
    @Query("""
            SELECT comment.cmtPostCode AS postCode, COUNT(comment) AS commentCount
            FROM CommunityComment comment
            WHERE comment.cmtPostCode IN :postCodes
            GROUP BY comment.cmtPostCode
            """)
    List<PostCommentCount> countByPostCodeIn(@Param("postCodes") List<Long> postCodes);

    // 단건 조회(상세페이지)용
    long countByCmtPostCode(Long cmtPostCode);

    void deleteByCmtPostCode(Long cmtPostCode);

    interface PostCommentCount {
        Long getPostCode();
        Long getCommentCount();
    }
}