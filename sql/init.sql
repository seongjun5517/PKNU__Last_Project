CREATE DATABASE IF NOT EXISTS skin_predict_platform
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE skin_predict_platform;

------------------------------------------------------------
-- 기존 테이블 삭제
-- FK 관계 때문에 자식 테이블부터 삭제
------------------------------------------------------------
DROP TABLE IF EXISTS cosmetics;
DROP TABLE IF EXISTS ratio;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS Notice;
DROP TABLE IF EXISTS Scrap;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS manager;
DROP TABLE IF EXISTS diagnose;
DROP TABLE IF EXISTS calendar_tasks;
DROP TABLE IF EXISTS posts_detail;
DROP TABLE IF EXISTS predict_model;
DROP TABLE IF EXISTS Community_Category;
DROP TABLE IF EXISTS users;

------------------------------------------------------------
-- 1. 사용자 테이블
------------------------------------------------------------
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY COMMENT '사용자 아이디',
    user_email VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일',
    user_pwd VARCHAR(255) NOT NULL COMMENT '사용자 비밀번호',
    user_nickname VARCHAR(255) COMMENT '사용자 닉네임',
    user_profile_image VARCHAR(255) COMMENT '사용자 프로필 사진 경로',
    user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '사용자 가입 날짜',
    user_birthday DATE COMMENT '사용자 생년월일',
    user_man TINYINT(1) DEFAULT 0 COMMENT '관리자 여부'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 2. 게시글 카테고리 테이블
------------------------------------------------------------
CREATE TABLE Community_Category (
    category_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 고유번호',
    category_name VARCHAR(255) NOT NULL COMMENT '카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 3. 예측 모델 테이블
------------------------------------------------------------
CREATE TABLE predict_model (
    model_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '모델 고유번호',
    model_name VARCHAR(255) NOT NULL COMMENT '모델 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 4. 게시글 테이블
------------------------------------------------------------
CREATE TABLE posts_detail (
    post_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 고유번호',
    post_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    category_code BIGINT NOT NULL COMMENT '카테고리 고유번호',
    post_title VARCHAR(255) NOT NULL COMMENT '게시글 제목',
    post_content TEXT COMMENT '게시글 내용',
    post_views INT DEFAULT 0 COMMENT '게시글 조회수',
    post_like INT DEFAULT 0 COMMENT '게시글 좋아요 수',
    post_scrap INT DEFAULT 0 COMMENT '게시글 스크랩 수',
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '게시글 작성 날짜',

    CONSTRAINT fk_posts_user
        FOREIGN KEY (post_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_posts_category
        FOREIGN KEY (category_code)
        REFERENCES Community_Category(category_code)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 5. 댓글 테이블
------------------------------------------------------------
CREATE TABLE comments (
    cmt_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 고유번호',
    cmt_post_code BIGINT NOT NULL COMMENT '게시글 고유번호',
    cmt_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    cmt_contents TEXT NOT NULL COMMENT '댓글 내용',
    cmt_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 입력 날짜',

    CONSTRAINT fk_comments_post
        FOREIGN KEY (cmt_post_code)
        REFERENCES posts_detail(post_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (cmt_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 6. 스크랩 테이블
------------------------------------------------------------
CREATE TABLE Scrap (
    scrap_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '스크랩 고유번호',
    scrap_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    scrap_post_code BIGINT NOT NULL COMMENT '게시글 고유번호',
    scrap_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '스크랩한 날짜',

    CONSTRAINT fk_scrap_user
        FOREIGN KEY (scrap_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_scrap_post
        FOREIGN KEY (scrap_post_code)
        REFERENCES posts_detail(post_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_scrap_user_post
        UNIQUE (scrap_user_id, scrap_post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 7. 캘린더 테이블
------------------------------------------------------------
CREATE TABLE calendar_tasks (
    cal_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '캘린더 고유번호',
    cal_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    cal_task_date DATE COMMENT '날짜',
    cal_title VARCHAR(255) COMMENT '제목',
    cal_description VARCHAR(255) COMMENT '상세설명',
    cal_is_completed TINYINT(1) DEFAULT 0 COMMENT '완료여부',
    cal_img_path VARCHAR(255) COMMENT '캘린더 이미지 경로',
    cal_category VARCHAR(255) COMMENT '캘린더 카테고리',

    CONSTRAINT fk_calendar_user
        FOREIGN KEY (cal_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 8. 진단 테이블
------------------------------------------------------------
CREATE TABLE diagnose (
    diag_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '진단 고유번호',
    diag_model_code BIGINT NOT NULL COMMENT '모델 고유번호',
    diag_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    diag_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '진단 날짜',
    diag_type VARCHAR(255) COMMENT '진단 타입',
    diag_image VARCHAR(255) COMMENT '진단 사진',
    diag_answer TEXT COMMENT '진단 답변',

    CONSTRAINT fk_diagnose_model
        FOREIGN KEY (diag_model_code)
        REFERENCES predict_model(model_code)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_diagnose_user
        FOREIGN KEY (diag_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 9. 결과 비율 테이블
------------------------------------------------------------
CREATE TABLE ratio (
    ratio_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '비율 코드',
    diag_code BIGINT NOT NULL COMMENT '진단 고유번호',
    ratio_name VARCHAR(255) COMMENT '결과 부위명',
    ratio_value VARCHAR(255) COMMENT '결과 점수',

    CONSTRAINT fk_ratio_diagnose
        FOREIGN KEY (diag_code)
        REFERENCES diagnose(diag_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 10. 성분 테이블
------------------------------------------------------------
CREATE TABLE ingredient (
    ing_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '성분 고유번호',
    diag_code BIGINT NOT NULL COMMENT '진단 고유번호',
    ing_name VARCHAR(255) COMMENT '성분 이름',

    CONSTRAINT fk_ingredient_diagnose
        FOREIGN KEY (diag_code)
        REFERENCES diagnose(diag_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 11. 화장품 테이블
------------------------------------------------------------
CREATE TABLE cosmetics (
    cos_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '화장품 고유번호',
    ing_code BIGINT NOT NULL COMMENT '성분 고유번호',
    cos_name VARCHAR(255) COMMENT '화장품 이름',
    cos_img VARCHAR(255) COMMENT '이미지',
    cos_url VARCHAR(255) COMMENT '화장품 URL',

    CONSTRAINT fk_cosmetics_ingredient
        FOREIGN KEY (ing_code)
        REFERENCES ingredient(ing_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 12. 알림 테이블
------------------------------------------------------------
CREATE TABLE Notice (
    noti_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '알림 고유번호',
    noti_sender_user_id VARCHAR(255) NOT NULL COMMENT '댓글 쓴 사용자 아이디',
    noti_receive_user_id VARCHAR(255) NOT NULL COMMENT '받는 사용자 아이디',
    noti_cmt_code BIGINT NULL COMMENT '댓글 고유번호',
    noti_post_code BIGINT NULL COMMENT '게시글 고유번호',
    noti_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 온 날짜',
    noti_is_read TINYINT(1) DEFAULT 0 COMMENT '알림 읽음 여부',
    noti_type VARCHAR(255) COMMENT '댓글/스크랩 알림 구분',

    CONSTRAINT fk_notice_sender_user
        FOREIGN KEY (noti_sender_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_notice_receive_user
        FOREIGN KEY (noti_receive_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_notice_comment
        FOREIGN KEY (noti_cmt_code)
        REFERENCES comments(cmt_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_notice_post
        FOREIGN KEY (noti_post_code)
        REFERENCES posts_detail(post_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

------------------------------------------------------------
-- 13. 관리자 테이블
------------------------------------------------------------
CREATE TABLE manager (
    man_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 고유번호',
    user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    man_auth VARCHAR(255) COMMENT '관리자 인증키',
    man_community TINYINT(1) DEFAULT 0 COMMENT '커뮤니티 관리',
    man_site TINYINT(1) DEFAULT 0 COMMENT '사이트 관리',

    CONSTRAINT fk_manager_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_manager_user
        UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;