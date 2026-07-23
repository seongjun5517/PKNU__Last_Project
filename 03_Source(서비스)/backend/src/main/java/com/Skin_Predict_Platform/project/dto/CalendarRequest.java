package com.Skin_Predict_Platform.project.dto;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;


// request 파일은 클라이언트가 서버에 보낼 수 있는 필드 제한하기 위함. 
@Getter
@Setter
public class CalendarRequest {
    private Date calTaskDate;
    private String calTitle;
    private Integer calIsCompleted;
    private String calImgPath;
    private String calCategory;
}
