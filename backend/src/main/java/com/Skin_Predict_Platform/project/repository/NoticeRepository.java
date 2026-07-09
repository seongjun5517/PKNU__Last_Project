package com.Skin_Predict_Platform.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Skin_Predict_Platform.project.model.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByNotiReceiverUserIdOrderByNotiCreatedAtDesc(String notiReceiverUserId);

    long countByNotiReceiverUserIdAndNotiIsReadFalse(String notiReceiverUserId);

    Optional<Notice> findByNotiCodeAndNotiReceiverUserId(Long notiCode, String notiReceiverUserId);

    List<Notice> findByNotiReceiverUserIdAndNotiIsReadFalse(String notiReceiverUserId);

    List<Notice> findByNotiReceiverUserIdAndNotiIsReadTrue(String notiReceiverUserId);

    void deleteByNotiPostCode(Long notiPostCode);

    void deleteByNotiCmtCode(Long notiCmtCode);
}
