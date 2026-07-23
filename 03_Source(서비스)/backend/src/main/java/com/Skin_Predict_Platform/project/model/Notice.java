package com.Skin_Predict_Platform.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "noti_code")
    private Long notiCode;

    @Column(name = "noti_sender_user_id", nullable = false, length = 255)
    private String notiSenderUserId;

    @Column(name = "noti_receiver_user_id", nullable = false, length = 255)
    private String notiReceiverUserId;

    @Column(name = "noti_cmt_code")
    private Long notiCmtCode;

    @Column(name = "noti_post_code")
    private Long notiPostCode;

    @Column(name = "noti_created_at")
    private LocalDateTime notiCreatedAt;

    @Column(name = "noti_is_read")
    private Boolean notiIsRead;

    @Column(name = "noti_type", nullable = false, length = 255)
    private String notiType;

    @PrePersist
    void prePersist() {
        if (notiCreatedAt == null) {
            notiCreatedAt = LocalDateTime.now();
        }
        if (notiIsRead == null) {
            notiIsRead = false;
        }
    }
}
