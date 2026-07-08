CREATE DATABASE IF NOT EXISTS skin_db
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE skin_db;

DROP TABLE IF EXISTS cosmetics;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS Notice;
DROP TABLE IF EXISTS Scrap;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS community_post_like;
DROP TABLE IF EXISTS calendar_tasks;
DROP TABLE IF EXISTS manager;
DROP TABLE IF EXISTS deep;
DROP TABLE IF EXISTS `type`;
DROP TABLE IF EXISTS posts_detail;
DROP TABLE IF EXISTS Community_Category;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY COMMENT '사용자 아이디',
    user_email VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일',
    user_pwd VARCHAR(255) NOT NULL COMMENT '사용자 비밀번호',
    user_nickname VARCHAR(255) COMMENT '사용자 닉네임',
    user_profile_image VARCHAR(255) COMMENT '사용자 프로필 사진',
    user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '사용자 가입 날짜',
    user_birthday DATE COMMENT '사용자 생년월일',
    user_man BOOLEAN DEFAULT FALSE COMMENT '관리자 여부'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Community_Category (
    category_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 고유번호',
    category_name VARCHAR(255) NOT NULL COMMENT '카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


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

CREATE TABLE community_post_like (
    like_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    like_post_code BIGINT NOT NULL,
    like_user_id VARCHAR(255) NOT NULL,
    like_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_community_post_like_post
        FOREIGN KEY (like_post_code)
        REFERENCES posts_detail(post_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_community_post_like_user
        FOREIGN KEY (like_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_community_post_like_user_post
        UNIQUE (like_user_id, like_post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

CREATE TABLE Notice (
    noti_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '알림 고유번호',
    noti_sender_user_id VARCHAR(255) NOT NULL COMMENT '보낸 사람 아이디',
    noti_receiver_user_id VARCHAR(255) NOT NULL COMMENT '받는 사용자 아이디',
    noti_cmt_code BIGINT COMMENT '댓글 고유번호',
    noti_post_code BIGINT COMMENT '게시글 고유번호',
    noti_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '알림 날짜',
    noti_is_read BOOLEAN DEFAULT FALSE COMMENT '알림 읽음 여부',
    noti_type VARCHAR(255) NOT NULL COMMENT '댓글/스크랩 알림 구분',

    CONSTRAINT fk_notice_sender
        FOREIGN KEY (noti_sender_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_notice_receiver
        FOREIGN KEY (noti_receiver_user_id)
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

CREATE TABLE calendar_tasks (
    cal_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '캘린더 고유번호',
    cal_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    cal_task_date DATE NOT NULL COMMENT '날짜',
    cal_title VARCHAR(255) NOT NULL COMMENT '제목',
    -- cal_description VARCHAR(255) COMMENT '상세설명',
    cal_is_completed BOOLEAN DEFAULT FALSE COMMENT '완료여부',
    cal_img_path VARCHAR(255) COMMENT '캘린더 이미지 경로',
    cal_category VARCHAR(255) COMMENT '캘린더 카테고리',

    CONSTRAINT fk_calendar_user
        FOREIGN KEY (cal_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE manager (
    man_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 고유번호',
    user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    man_auth VARCHAR(255) COMMENT '관리자 인증키',
    man_community BOOLEAN DEFAULT FALSE COMMENT '커뮤니티 관리',
    man_site BOOLEAN DEFAULT FALSE COMMENT '사이트 관리',

    CONSTRAINT fk_manager_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_manager_user
        UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deep (
    dtype_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '질병 고유번호',
    dtype_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    dtype_date DATE NOT NULL COMMENT '질병 진단 날짜',
    dtype_result VARCHAR(255) COMMENT '질병 진단 결과',
    dtype_cnt INT DEFAULT 0 COMMENT '질병 갯수',
    dtype_img VARCHAR(255) COMMENT '결과 사진',

    CONSTRAINT fk_deep_user
        FOREIGN KEY (dtype_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `type` (
    stype_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '타입 고유번호',
    stype_user_id VARCHAR(255) NOT NULL COMMENT '사용자 아이디',
    stype_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '진단 날짜',
    stype_face VARCHAR(255) COMMENT '얼굴 부위명',
    stype_name VARCHAR(255) COMMENT '결과명',
    stype_fig INT COMMENT '결과 수치',

    CONSTRAINT fk_type_user
        FOREIGN KEY (stype_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ingredient (
    ing_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '성분 고유번호',
    stype_code BIGINT COMMENT '타입 고유번호',
    ing_name VARCHAR(255) NOT NULL COMMENT '성분 이름',
    dtype_code BIGINT COMMENT '질병 고유번호',

    CONSTRAINT fk_ingredient_type
        FOREIGN KEY (stype_code)
        REFERENCES `type`(stype_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_ingredient_deep
        FOREIGN KEY (dtype_code)
        REFERENCES deep(dtype_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cosmetics (
    cos_code BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '화장품 고유번호',
    ing_code BIGINT NOT NULL COMMENT '성분 고유번호',
    cos_name VARCHAR(255) NOT NULL COMMENT '화장품 이름',
    cos_img VARCHAR(255) COMMENT '이미지',
    cos_url VARCHAR(255) COMMENT '화장품 URL',

    CONSTRAINT fk_cosmetics_ingredient
        FOREIGN KEY (ing_code)
        REFERENCES ingredient(ing_code)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
