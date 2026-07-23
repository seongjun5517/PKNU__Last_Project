package com.Skin_Predict_Platform.project.model;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "calendar_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Calendar {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cal_code", nullable = false)
    private Long calCode;

    @Column(name = "cal_user_id", nullable = false)
    private String calUserId;

    @Column(name = "cal_task_date")
    @Temporal(TemporalType.DATE)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date calTaskDate;
    
    @Column(name = "cal_title")
    private String calTitle;

    // @Column(name = "cal_description")
    // private String calDescription;

    @Column(name = "cal_is_completed")
    private Integer calIsCompleted;
    
    @Column(name = "cal_img_path")
    private String calImgPath;

    @Column(name = "cal_category")
    private String calCategory;

}
