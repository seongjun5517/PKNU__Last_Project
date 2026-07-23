package com.Skin_Predict_Platform.project.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Skin_Predict_Platform.project.model.Deepmodel; // Optional을 위해 추가

@Repository
public interface DeepRepository extends JpaRepository<Deepmodel, Long> {

    Optional<Deepmodel> findByDtypeCodeAndDtypeUserId(Long dtypeCode, String dtypeUserId);

    // 오늘 데이터 개수
    @Query(value = "SELECT COUNT(*) FROM deep WHERE dtype_user_id = :userId AND DATE(dtype_date) = CURDATE()", nativeQuery = true)
    int countTodayByUserId(@Param("userId") String userId);

    // 오늘 가장 최근 예측 결과
    @Query(value = "SELECT dtype_result FROM deep WHERE dtype_user_id = :userId AND DATE(dtype_date) = CURDATE() ORDER BY dtype_date DESC LIMIT 1", nativeQuery = true)
    Optional<String> findTodayPredictByUserId(@Param("userId") String userId);

    List<Deepmodel> findByDtypeUserIdAndDtypeDateGreaterThanEqualAndDtypeDateLessThan(
            String userId,
            LocalDateTime start,
            LocalDateTime end);

    List<Deepmodel> findByDtypeUserIdOrderByDtypeDateDescDtypeCodeAsc(String userId);

    List<Deepmodel> findByDtypeUserIdOrderByDtypeDateAsc(String userId);
}
