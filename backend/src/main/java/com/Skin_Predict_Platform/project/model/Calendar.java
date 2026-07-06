package com.Skin_Predict_Platform.project.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "calendar")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Calendar {
    
    @Id
    @Column(name = "cal_code", nullable = false)
    private String calCode;

    @Column(name = "cal_user_id", nullable = false)
    private String calUserId;

    @Column(name = "cal_task_date")
    private Date calTaskDate;
    
    @Column(name = "cal_title")
    private String calTitle;

    @Column(name = "cal_description")
    private String calDescription;

    @Column(name = "cal_is_completed")
    private Number calIsCompleted;
    
    @Column(name = "cal_img_path")
    private String calImgPath;

}
