-- id : skin
-- pass : 1234

------------------------------------------------------------
-- 1. TABLE 생성
------------------------------------------------------------

create table member (
    mem_id number generated always as identity primary key,
    mem_email varchar2(255) unique not null,
    mem_pwd varchar2(255) not null,
    mem_nickname varchar2(100),
    mem_profile_img varchar2(255),
    mem_created_at date default sysdate,
    mem_bir date
);

create table calendar(
    cal_code number generated always as identity primary key,
    cal_mem_id number,
    cal_task_date date,
    cal_title varchar2(255),
    cal_description varchar2(1500),
    cal_completed number(1),
    cal_mem_img varchar2(255),

    constraint fk_mem_calendar foreign key (cal_mem_id)
        references member(mem_id) on delete cascade
);

create table pred_model(
    model_code number generated always as identity primary key,
    model_name varchar2(100)
);

create table diag(
    diag_code number generated always as identity primary key,
    diag_mem_id number,
    diag_date date default sysdate,
    diag_model_id number,
    diag_img varchar2(255),
    diag_score number(5,2),
    diag_answer varchar2(1500),

    constraint fk_mem_diag foreign key(diag_mem_id)
        references member(mem_id) on delete cascade,

    constraint fk_pred_model_diag foreign key(diag_model_id)
        references pred_model(model_code)
);

create table com_cate(
    cate_code number generated always as identity primary key,
    cate_name varchar2(255)
);

create table post(
    post_code number generated always as identity primary key,
    post_mem_id number,
    post_title varchar2(255),
    post_content varchar2(1500),
    post_view number default 0,
    post_like number default 0,
    post_scrap number default 0,
    post_date date default sysdate,
    post_cate_code number,
    post_read number(1),

    constraint fk_mem_post foreign key(post_mem_id)
        references member(mem_id) on delete cascade,

    constraint fk_com_cate_post foreign key(post_cate_code)
        references com_cate(cate_code)
);

create table coment(
    cmt_code number generated always as identity primary key,
    cmt_post_code number,
    cmt_mem_id number,
    cmt_content varchar2(1500),
    cmt_create_at date default sysdate,

    constraint fk_post_coment foreign key(cmt_post_code)
        references post(post_code) on delete cascade,

    constraint fk_mem_coment foreign key(cmt_mem_id)
        references member(mem_id) on delete cascade
);

create table scrap(
    scrap_code number generated always as identity primary key,
    scrap_post_code number,
    scrap_mem_id number,
    scrap_created_at date default sysdate,

    constraint fk_post_scrap foreign key(scrap_post_code)
        references post(post_code) on delete cascade,

    constraint fk_mem_scrap foreign key(scrap_mem_id)
        references member(mem_id) on delete cascade,
        
    constraint uk_scrap unique(scrap_post_code, scrap_mem_id)
);

-- 좋아요 테이블 (scrap과 동일한 구조, 누가 어떤 글에 좋아요 눌렀는지 기록)
-- 좋아요 테이블을 따로 만든 이유 : 누가 어떤 글에 좋아요를 눌렀는지 기록하기 위해서
-- likes 테이블을 만들지않고 그냥 기존의 post_like에서 가져오면 에러가 난다.
create table likes(
    like_code number generated always as identity primary key,
    like_post_code number,
    like_mem_id number,
    like_created_at date default sysdate,

    constraint fk_post_like foreign key(like_post_code)
        references post(post_code) on delete cascade,

    constraint fk_mem_like foreign key(like_mem_id)
        references member(mem_id) on delete cascade,
    
    constraint uk_like unique(like_post_code, like_mem_id)-- 유저 1이 게시글 1에 하나의 좋아요만 가능하게
);

create table notice (
    noti_code number generated always as identity primary key,
    noti_receiver_id number,      -- 알림 받는 사람
    noti_write_id number,         -- 알림 발생시킨(작성한) 사람
    noti_like_code number,        -- 어떤 좋아요 (좋아요 알림인 경우)
    noti_cmt_code number,         -- 어떤 댓글 (댓글 알림인 경우)
    noti_post_code number,        -- 어떤 게시글
    noti_read_code number(1) default 0,  -- 0: 읽지않음, 1: 읽음
    noti_created_at date default sysdate,

    constraint fk_mem_receiver foreign key(noti_receiver_id)
        references member(mem_id) on delete cascade,

    constraint fk_mem_write foreign key(noti_write_id)
        references member(mem_id) on delete cascade,

    constraint fk_like_noti foreign key(noti_like_code)
        references likes(like_code) on delete cascade,

    constraint fk_cmt_noti foreign key(noti_cmt_code)
        references coment(cmt_code) on delete cascade,

    constraint fk_post_noti foreign key(noti_post_code)
        references post(post_code) on delete cascade
);

------------------------------------------------------------
-- 2. FK 컬럼 인덱스 (Oracle은 FK에 자동 인덱스 안 생김)
-- FK 컬럼 인덱스를 만든이유 : 데이터 찾는 속도를 늘리기위해서
------------------------------------------------------------

create index idx_cal_mem_id        on calendar(cal_mem_id);

create index idx_diag_mem_id       on diag(diag_mem_id);
create index idx_diag_model_id     on diag(diag_model_id);

create index idx_post_mem_id       on post(post_mem_id);
create index idx_post_cate_code    on post(post_cate_code);

create index idx_coment_post_code  on coment(cmt_post_code);
create index idx_coment_mem_id     on coment(cmt_mem_id);

create index idx_scrap_post_code   on scrap(scrap_post_code);
create index idx_scrap_mem_id      on scrap(scrap_mem_id);

create index idx_like_post_code    on likes(like_post_code);
create index idx_like_mem_id       on likes(like_mem_id);

create index idx_noti_receiver_id  on notice(noti_receiver_id);
create index idx_noti_write_id     on notice(noti_write_id);
create index idx_noti_like_code    on notice(noti_like_code);
create index idx_noti_cmt_code     on notice(noti_cmt_code);
create index idx_noti_post_code    on notice(noti_post_code);

