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
@Table(name = "`type`")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkinTypeResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stype_code", nullable = false)
    private Long stypeCode;

    @Column(name = "stype_user_id", nullable = false, length = 255)
    private String stypeUserId;

    @Column(name = "stype_date")
    private LocalDateTime stypeDate;

    @Column(name = "stype_face", length = 255)
    private String stypeFace;

    @Column(name = "stype_name", length = 255)
    private String stypeName;

    @Column(name = "stype_fig")
    private Integer stypeFig;

    @PrePersist
    void prePersist() {
        if (stypeDate == null) {
            stypeDate = LocalDateTime.now();
        }
    }
}
