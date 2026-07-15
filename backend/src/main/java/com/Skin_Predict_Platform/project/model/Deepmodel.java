package com.Skin_Predict_Platform.project.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "deep")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Deepmodel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dtype_code", nullable = false)
    private Long dtypeCode;

    @Column(name = "dtype_user_id", nullable = false)
    private String dtypeUserId;

    @Column(name = "dtype_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date dtypeDate;

    @Column(name = "dtype_result")
    private String dtypeResult;

    @Column(name = "dtype_cnt")
    private Integer dtypeCnt;

    @Column(name = "dtype_img")
    private String dtypeImg;

    
}
