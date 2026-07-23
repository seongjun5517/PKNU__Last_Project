CREATE DATABASE IF NOT EXISTS skin_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE skin_db;

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_pwd VARCHAR(255) NOT NULL,
    user_nickname VARCHAR(100),
    user_profile_image VARCHAR(500),
    user_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    user_birthday DATE,
    user_man BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Community_Category (
    category_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts_detail (
    post_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_user_id VARCHAR(255) NOT NULL,
    category_code BIGINT NOT NULL,
    post_title VARCHAR(255) NOT NULL,
    post_content TEXT,
    post_views INT DEFAULT 0,
    post_like INT DEFAULT 0,
    post_scrap INT DEFAULT 0,
    post_date DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_posts_user FOREIGN KEY (post_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_posts_category FOREIGN KEY (category_code)
        REFERENCES Community_Category(category_code) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_post_like (
    like_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    like_post_code BIGINT NOT NULL,
    like_user_id VARCHAR(255) NOT NULL,
    like_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_community_post_like_post FOREIGN KEY (like_post_code)
        REFERENCES posts_detail(post_code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_community_post_like_user FOREIGN KEY (like_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_community_post_like_user_post UNIQUE (like_user_id, like_post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_report (
    report_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_post_code BIGINT NOT NULL,
    report_user_id VARCHAR(255) NOT NULL,
    report_reason VARCHAR(50) NOT NULL,
    report_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_community_report_post FOREIGN KEY (report_post_code)
        REFERENCES posts_detail(post_code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_community_report_user FOREIGN KEY (report_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_community_report_user_post UNIQUE (report_user_id, report_post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    cmt_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    cmt_post_code BIGINT NOT NULL,
    cmt_user_id VARCHAR(255) NOT NULL,
    cmt_contents TEXT NOT NULL,
    cmt_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_comments_post FOREIGN KEY (cmt_post_code)
        REFERENCES posts_detail(post_code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (cmt_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Scrap (
    scrap_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    scrap_user_id VARCHAR(255) NOT NULL,
    scrap_post_code BIGINT NOT NULL,
    scrap_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_scrap_user FOREIGN KEY (scrap_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_scrap_post FOREIGN KEY (scrap_post_code)
        REFERENCES posts_detail(post_code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_scrap_user_post UNIQUE (scrap_user_id, scrap_post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notice (
    noti_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    noti_sender_user_id VARCHAR(255) NOT NULL,
    noti_receiver_user_id VARCHAR(255) NOT NULL,
    noti_cmt_code BIGINT,
    noti_post_code BIGINT,
    noti_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    noti_is_read BOOLEAN DEFAULT FALSE,
    noti_type VARCHAR(255) NOT NULL,
    CONSTRAINT fk_notice_sender FOREIGN KEY (noti_sender_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notice_receiver FOREIGN KEY (noti_receiver_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notice_comment FOREIGN KEY (noti_cmt_code)
        REFERENCES comments(cmt_code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notice_post FOREIGN KEY (noti_post_code)
        REFERENCES posts_detail(post_code) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calendar_tasks (
    cal_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    cal_user_id VARCHAR(255) NOT NULL,
    cal_task_date DATE NOT NULL,
    cal_title VARCHAR(255) NOT NULL,
    cal_is_completed INT DEFAULT 0,
    cal_img_path VARCHAR(255),
    cal_category VARCHAR(255),
    CONSTRAINT fk_calendar_user FOREIGN KEY (cal_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS manager (
    man_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    man_auth VARCHAR(255),
    man_community BOOLEAN DEFAULT FALSE,
    man_site BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_manager_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_manager_user UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deep (
    dtype_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    dtype_user_id VARCHAR(255) NOT NULL,
    dtype_date DATETIME(6) NOT NULL,
    dtype_result VARCHAR(255),
    dtype_cnt INT DEFAULT 0,
    dtype_img VARCHAR(255),
    CONSTRAINT fk_deep_user FOREIGN KEY (dtype_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `type` (
    stype_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    stype_user_id VARCHAR(255) NOT NULL,
    stype_date DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    stype_face VARCHAR(255),
    stype_name VARCHAR(255),
    stype_fig INT,
    CONSTRAINT fk_type_user FOREIGN KEY (stype_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback (
    fb_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    fb_user_id VARCHAR(255) NOT NULL,
    fb_type VARCHAR(30) NOT NULL,
    fb_evaluate VARCHAR(30) NOT NULL,
    fb_comment TEXT,
    fb_created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_feedback_user FOREIGN KEY (fb_user_id)
        REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_feedback_created_at (fb_created_at),
    INDEX idx_feedback_type (fb_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- 최고 관리자 삽입
INSERT INTO skin_db.users (
    user_id,
    user_email,
    user_pwd,
    user_nickname,
    user_profile_image,
    user_created_at,
    user_birthday,
    user_man
)
VALUES (
    'admin',
    'admin@skin.com',
    'admin1234',
    '최고관리자',
    NULL,
    NOW(),
    '2026-07-06',
    1
);

INSERT INTO skin_db.manager (
    user_id,
    man_auth,
    man_community,
    man_site
)
VALUES (
    'admin',
    'SUPER_ADMIN',
    1,
    1
);