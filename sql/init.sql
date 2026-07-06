CREATE DATABASE IF NOT EXISTS skin_db
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE skin_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notice;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS scrap;
DROP TABLE IF EXISTS cosmetics;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS ratio;
DROP TABLE IF EXISTS diagnose;
DROP TABLE IF EXISTS calendar_tasks;
DROP TABLE IF EXISTS posts_detail;
DROP TABLE IF EXISTS community_category;
DROP TABLE IF EXISTS predict_model;
DROP TABLE IF EXISTS chatbot;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 사용자
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY COMMENT '사용자 아이디',
    user_email VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일',
    user_pwd VARCHAR(255) NOT NULL COMMENT '사용자 비밀번호',
    user_nickname VARCHAR(100) COMMENT '사용자 닉네임',
    user_profile_image VARCHAR(500) COMMENT '사용자 프로필 사진 경로',
    user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '사용자 가입 날짜',
    user_birthday DATE COMMENT '사용자 생년월일',
    user_man TINYINT(1) DEFAULT 0 COMMENT '관리자 여부'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글 카테고리
CREATE TABLE community_category (
    category_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 고유번호',
    category_name VARCHAR(255) NOT NULL COMMENT '카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 예측 모델
CREATE TABLE predict_model (
    model_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '모델 고유번호',
    model_name VARCHAR(20) NOT NULL COMMENT '모델 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글
CREATE TABLE posts_detail (
    post_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 고유번호',
    post_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    category_code BIGINT NOT NULL COMMENT '카테고리 고유번호',
    post_title VARCHAR(255) NOT NULL COMMENT '게시글 제목',
    post_content TEXT COMMENT '게시글 내용',
    post_views INT DEFAULT 0 COMMENT '게시글 조회수',
    post_like INT DEFAULT 0 COMMENT '게시글 좋아요수',
    post_scrap INT DEFAULT 0 COMMENT '게시글 스크랩수',
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '게시글 작성 날짜',
    post_bool_read TINYINT(1) DEFAULT 0 COMMENT '알림 확인 여부',

    CONSTRAINT fk_posts_user
        FOREIGN KEY (post_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_posts_category
        FOREIGN KEY (category_code)
        REFERENCES community_category(category_code)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 댓글
CREATE TABLE comments (
    cmt_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 고유번호',
    cmt_post_code BIGINT NOT NULL COMMENT '게시글 고유번호',
    cmt_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    cmt_contents TEXT COMMENT '댓글 내용',
    cmt_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 입력 날짜',

    CONSTRAINT fk_comments_post
        FOREIGN KEY (cmt_post_code)
        REFERENCES posts_detail(post_code)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (cmt_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 스크랩
CREATE TABLE scrap (
    scrap_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '스크랩 고유번호',
    scrap_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    scrap_post_code BIGINT NOT NULL COMMENT '게시글 고유번호',
    scrap_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '스크랩한 날짜',

    CONSTRAINT fk_scrap_user
        FOREIGN KEY (scrap_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_scrap_post
        FOREIGN KEY (scrap_post_code)
        REFERENCES posts_detail(post_code)
        ON DELETE CASCADE,

    CONSTRAINT uq_scrap_user_post
        UNIQUE (scrap_user_id, scrap_post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 캘린더
CREATE TABLE calendar_tasks (
    cal_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '캘린더 고유번호',
    cal_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    cal_task_date DATE COMMENT '날짜',
    cal_title VARCHAR(255) COMMENT '제목',
    cal_description VARCHAR(500) COMMENT '상세 설명',
    cal_is_completed TINYINT(1) DEFAULT 0 COMMENT '완료 여부',
    cal_img_path VARCHAR(500) COMMENT '캘린더 이미지 경로',

    CONSTRAINT fk_calendar_user
        FOREIGN KEY (cal_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 진단
CREATE TABLE diagnose (
    diag_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '진단 고유번호',
    diag_model_code BIGINT COMMENT '모델 고유번호',
    diag_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    diag_date DATE COMMENT '진단 날짜',
    diag_model_id INT COMMENT '진단 타입',
    diag_image VARCHAR(500) COMMENT '진단 사진 경로',
    diag_answer TEXT COMMENT '진단 답변',

    CONSTRAINT fk_diagnose_model
        FOREIGN KEY (diag_model_code)
        REFERENCES predict_model(model_code)
        ON DELETE SET NULL,

    CONSTRAINT fk_diagnose_user
        FOREIGN KEY (diag_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 결과 비율
CREATE TABLE ratio (
    ratio_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '비율 코드',
    diag_code BIGINT NOT NULL COMMENT '진단 고유번호',
    ratio_name VARCHAR(100) COMMENT '결과 부위명',
    ratio_value DECIMAL(5,2) COMMENT '결과 점수',

    CONSTRAINT fk_ratio_diagnose
        FOREIGN KEY (diag_code)
        REFERENCES diagnose(diag_code)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 성분 테이블
CREATE TABLE ingredient (
    ing_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '성분 고유번호',
    diag_code BIGINT COMMENT '진단 고유번호',
    ing_name VARCHAR(20) COMMENT '성분 이름',

    CONSTRAINT fk_ingredient_diagnose
        FOREIGN KEY (diag_code)
        REFERENCES diagnose(diag_code)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 화장품 테이블
CREATE TABLE cosmetics (
    cos_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '화장품 고유번호',
    ing_code BIGINT COMMENT '성분 고유번호',
    cos_name VARCHAR(20) COMMENT '화장품 이름',
    cos_img VARCHAR(500) COMMENT '화장품 이미지 경로',
    cos_url VARCHAR(500) COMMENT '화장품 URL',

    CONSTRAINT fk_cosmetics_ingredient
        FOREIGN KEY (ing_code)
        REFERENCES ingredient(ing_code)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 알림
CREATE TABLE notice (
    noti_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '알림 고유번호',
    noti_sender_user_id VARCHAR(255) NOT NULL COMMENT '댓글 쓴 사용자 아이디',
    noti_receiver_user_id VARCHAR(255) NOT NULL COMMENT '받는 사용자 아이디',
    noti_cmt_code BIGINT COMMENT '댓글 고유번호',
    noti_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 온 날짜',

    CONSTRAINT fk_notice_sender
        FOREIGN KEY (noti_sender_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notice_receiver
        FOREIGN KEY (noti_receiver_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notice_comment
        FOREIGN KEY (noti_cmt_code)
        REFERENCES comments(cmt_code)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 챗봇
CREATE TABLE chatbot (
    bot_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '챗봇 고유번호',
    bot_question VARCHAR(255) COMMENT '챗봇 질문 내용',
    bot_answer TEXT COMMENT '챗봇 답변 내용',
    bot_thesis_contents TEXT COMMENT '논문 내용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;