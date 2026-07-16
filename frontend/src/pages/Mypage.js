import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mypage.css";
// 프로젝트의 실제 axios 인스턴스 경로에 맞게 수정하세요.
// (프로젝트에서 쓰던 springApi 를 그대로 재사용합니다)
import { springApi } from "../config/axiosInstance";
import AnalysisHistory from "./AnalysisHistory";
import { getProfileImageSrc } from "../utils/profileImage";
import { useAuth } from "../context/AuthContext";
import {
  isImageFileTooLarge,
  MAX_IMAGE_FILE_SIZE_LABEL,
} from "../config/uploadLimits";


const INFO_MENU = [
  { key: "profile", label: "프로필" },
  { key: "edit", label: "정보 수정" },
  { key: "password", label: "비밀번호 변경" },
  { key: "delete", label: "회원 탈퇴" },
];

const POST_MENU = [
  { key: "mine", label: "내가 쓴 게시글" },
  { key: "liked", label: "좋아요한 글" },
  { key: "scrapped", label: "스크랩한 게시물" },
  { key: "comments", label: "내가 작성한 댓글" },
];

/* ---------------- 분석 기록 라인 차트 (외부 라이브러리 없이 순수 SVG) ---------------- */
/* 백엔드 연결 전까지는 사용하지 않지만, 나중에 다시 쓸 수 있도록 컴포넌트는 그대로 둡니다. */
function AnalysisChart({ data }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const width = 760;
  const height = 220;
  const padX = 28;
  const padTop = 20;
  const padBottom = 34;

  const { points, gridYs } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], gridYs: [] };
    }
    const values = data.map((d) => d.score);
    const maxY = Math.max(...values, 1);
    const minY = Math.min(...values, 0);
    const range = maxY - minY || 1;

    const innerW = width - padX * 2;
    const innerH = height - padTop - padBottom;

    const points = data.map((d, i) => {
      const x =
        data.length === 1
          ? padX + innerW / 2
          : padX + (i / (data.length - 1)) * innerW;
      const y = padTop + innerH - ((d.score - minY) / range) * innerH;
      return { ...d, x, y };
    });

    const steps = 4;
    const gridYs = Array.from({ length: steps + 1 }, (_, i) => {
      const value = minY + (range * i) / steps;
      const y = padTop + innerH - ((value - minY) / range) * innerH;
      return { y, value: Math.round(value) };
    });

    return { points, gridYs };
  }, [data]);

  if (!data || data.length === 0) {
    return <p className="analysis_empty">아직 분석 기록이 없어요. 첫 피부 분석을 진행해보세요.</p>;
  }

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    `${linePath} ` +
    `L ${points[points.length - 1].x.toFixed(1)} ${(height - padBottom).toFixed(1)} ` +
    `L ${points[0].x.toFixed(1)} ${(height - padBottom).toFixed(1)} Z`;

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="analysis_chart_pos">
      <div className="analysis_chart_wrap">
        <svg viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="mypage_chart_gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--rose)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridYs.map((g, i) => (
            <line
              key={i}
              x1={padX}
              x2={width - padX}
              y1={g.y}
              y2={g.y}
              className="chart_grid_line"
            />
          ))}

          <path d={areaPath} className="chart_area_path" />
          <path d={linePath} className="chart_line_path" />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIdx === i ? 6 : 4}
                className={`chart_point${hoverIdx === i ? " hovered" : ""}`}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
              {(i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0) && (
                <text
                  x={p.x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  className="chart_axis_label"
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {hovered && (
        <div
          className="chart_tooltip"
          style={{
            left: `${(hovered.x / width) * 100}%`,
            top: `${(hovered.y / height) * 100}%`,
          }}
        >
          <span className="chart_tooltip_date">{hovered.label}</span>
          {hovered.dominant ? `${hovered.dominant} · ` : ""}
          {hovered.score}점
        </div>
      )}
    </div>
  );
}

/* ---------------- 마이페이지 ---------------- */
export default function Mypage() {
  const navigate = useNavigate();
  const { userId, authLoading, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("info");

  const [infoMenuOpen, setInfoMenuOpen] = useState(true);
  const [activeInfoTab, setActiveInfoTab] = useState("profile");

  const [postsMenuOpen, setPostsMenuOpen] = useState(false);
  const [activePostTab, setActivePostTab] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [postsByTab, setPostsByTab] = useState({ mine: null, liked: null, scrapped: null });
  const [postsLoadingTab, setPostsLoadingTab] = useState({ mine: false, liked: false, scrapped: false });
  const [myComments, setMyComments] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deletingCommentCodes, setDeletingCommentCodes] = useState({});
  const [deletingPostCodes, setDeletingPostCodes] = useState({});

  // 분석 기록은 백엔드 연결 전까지 보류 (state만 남겨둠)
  const [analysisHistory] = useState(null);

  // 정보 수정 폼 상태
  const [editNickname, setEditNickname] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // 비밀번호 변경 폼 상태
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);

  // 회원 탈퇴 상태
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---------------- 내 정보 조회 ----------------
  // GET /user/me
  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setProfileLoading(false);
      return;
    }
    springApi
      .get(`/user/me`)
      .then((res) => {
        setProfile(res.data);
        setEditNickname(res.data?.userNickname || "");
      })
      .catch((err) => console.error("내 정보 조회 실패:", err))
      .finally(() => setProfileLoading(false));
  }, [authLoading, userId]);

  // ---------------- 선택된 게시물 탭 하나만 지연 로딩 (아직 안 불러왔을 때만) ----------------
  // 현재 세션 사용자의 게시물 활동 조회
  useEffect(() => {
    if (!userId || !activePostTab) return;
    if (activePostTab === "comments") return;
    if (postsByTab[activePostTab] !== null) return;

    const endpointByTab = {
      mine: `/community/posts/mine`,
      liked: `/community/posts/liked`,
      scrapped: `/community/posts/scrapped`,
    };

    setPostsLoadingTab((prev) => ({ ...prev, [activePostTab]: true }));
    springApi
      .get(endpointByTab[activePostTab])
      .then((res) => {
        setPostsByTab((prev) => ({ ...prev, [activePostTab]: res.data || [] }));
      })
      .catch((err) => {
        console.error(`${activePostTab} 게시글 조회 실패:`, err);
        setPostsByTab((prev) => ({ ...prev, [activePostTab]: [] }));
      })
      .finally(() => {
        setPostsLoadingTab((prev) => ({ ...prev, [activePostTab]: false }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePostTab, userId]);

  useEffect(() => {
    if (!userId || activeSection !== "posts" || activePostTab !== "comments") return;
    if (myComments !== null) return;

    setCommentsLoading(true);
    springApi
      .get(`/community/comments/mine`)
      .then((res) => setMyComments(res.data || []))
      .catch((err) => {
        console.error("내 댓글 조회 실패:", err);
        setMyComments([]);
      })
      .finally(() => setCommentsLoading(false));
  }, [activePostTab, activeSection, myComments, userId]);

  const handleSelectInfoTab = (key) => {
    setActiveInfoTab(key);
    setActiveSection("info");
    setEditMessage(null);
    setPwMessage(null);
  };

  const handleSelectPostTab = (key) => {
    setActivePostTab(key);
    setActiveSection("posts");
  };

  const handleDeleteComment = async (event, commentCode) => {
    event.stopPropagation();

    if (!userId || deletingCommentCodes[commentCode]) return;

    setDeletingCommentCodes((prev) => ({ ...prev, [commentCode]: true }));

    try {
      await springApi.delete(`/community/comments/${commentCode}`);
      setMyComments((prev) =>
        (prev || []).filter((comment) => comment.cmtCode !== commentCode)
      );
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      alert("댓글 삭제에 실패했습니다.");
    } finally {
      setDeletingCommentCodes((prev) => ({ ...prev, [commentCode]: false }));
    }
  };

  const handleDeletePost = async (event, postCode) => {
    event.stopPropagation();

    if (!userId || deletingPostCodes[postCode]) return;
    if (!window.confirm("게시글을 삭제할까요? 삭제 후에는 복구할 수 없습니다.")) {
      return;
    }

    setDeletingPostCodes((prev) => ({ ...prev, [postCode]: true }));

    try {
      await springApi.delete(`/community/posts/${postCode}`);
      setPostsByTab((prev) => ({
        mine: prev.mine ? prev.mine.filter((post) => post.postCode !== postCode) : prev.mine,
        liked: prev.liked ? prev.liked.filter((post) => post.postCode !== postCode) : prev.liked,
        scrapped: prev.scrapped
          ? prev.scrapped.filter((post) => post.postCode !== postCode)
          : prev.scrapped,
      }));
      setMyComments((prev) =>
        prev ? prev.filter((comment) => comment.postCode !== postCode) : prev
      );
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      alert("게시글 삭제에 실패했습니다.");
    } finally {
      setDeletingPostCodes((prev) => ({ ...prev, [postCode]: false }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isImageFileTooLarge(file)) {
      setEditImageFile(null);
      setEditPreview(null);
      setEditMessage({
        type: "error",
        text: `이미지 파일이 너무 커요. ${MAX_IMAGE_FILE_SIZE_LABEL} 이하 이미지로 다시 선택해주세요.`,
      });
      e.target.value = "";
      return;
    }

    setEditMessage(null);
    setEditImageFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  // ---------------- 정보 수정 ----------------
  // 이미지가 있으면 /user/me/profile-image를 먼저 호출한 뒤 /user/me에 반영한다.
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMessage(null);

    try {
      let uploadedImagePath = null;

      if (editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);

        const imgRes = await springApi.post("/user/me/profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // 응답: { user_profile_image: "/images/profile/xxx.jpg" }
        uploadedImagePath = imgRes.data?.user_profile_image ?? null;
      }

      const res = await springApi.put(`/user/me`, {
        user_nickname: editNickname,
        ...(uploadedImagePath ? { user_profile_image: uploadedImagePath } : {}),
      });

      const nextProfile = {
        ...profile,
        ...res.data,
        ...(uploadedImagePath ? { userProfileImage: uploadedImagePath } : {}),
      };

      setProfile(nextProfile);
      setEditImageFile(null);
      setEditPreview(null);
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { userId, profile: nextProfile },
        })
      );
      setEditMessage({ type: "success", text: "정보가 수정됐어요." });
    } catch (err) {
      console.error("정보 수정 실패:", err);
      const message =
        err.response?.status === 413
          ? "이미지 파일이 너무 커요. 10MB 이하 이미지로 다시 선택해주세요."
          : "수정 중 문제가 발생했어요. 다시 시도해주세요.";
      setEditMessage({ type: "error", text: message });
    } finally {
      setEditSaving(false);
    }
  };

  // ---------------- 비밀번호 변경 ----------------
  // PUT /user/me/password  body: { current_pwd, new_pwd }
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwNext !== pwConfirm) {
      setPwMessage({ type: "error", text: "새 비밀번호가 서로 달라요." });
      return;
    }
    setPwSaving(true);
    setPwMessage(null);
    springApi
      .put(`/user/me/password`, {
        current_pwd: pwCurrent,
        new_pwd: pwNext,
      })
      .then(() => {
        setPwMessage({ type: "success", text: "비밀번호가 변경됐어요." });
        setPwCurrent("");
        setPwNext("");
        setPwConfirm("");
      })
      .catch((err) => {
        console.error("비밀번호 변경 실패:", err);
        const serverMsg = err.response?.data;
        setPwMessage({
          type: "error",
          text: typeof serverMsg === "string" ? serverMsg : "현재 비밀번호를 다시 확인해주세요.",
        });
      })
      .finally(() => setPwSaving(false));
  };

  // ---------------- 회원 탈퇴 ----------------
  // DELETE /user/me
  const handleDeleteAccount = async () => {
    if (!deleteChecked) return;
    setDeleting(true);
    try {
      await springApi.delete(`/user/me`);
      try {
        await logout();
      } catch (logoutError) {
        console.warn("회원 탈퇴 후 세션 정리 요청 실패:", logoutError);
      }
      navigate("/");
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      setDeleting(false);
    }
  };

  return (
    <div className="mypage_app">
      <div className="mypage_header">
        <p className="mypage_eyebrow">MY PAGE</p>
        <h1 className="mypage_title">마이페이지</h1>
        <p className="mypage_subtitle">내 정보와 활동 기록, 피부 분석 이력을 한눈에 확인하세요.</p>
      </div>

      <div className="mypage_layout">
        {/* 좌측 메뉴 */}
        <nav className="mypage_sidebar">
          <button
            className={`mypage_nav_item mypage_nav_item_expandable${
              activeSection === "info" ? " active" : ""
            }`}
            onClick={() => setInfoMenuOpen((v) => !v)}
          >
            내 정보
            <span className={`mypage_nav_chevron${infoMenuOpen ? " open" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <div className={`mypage_submenu${infoMenuOpen ? " open" : ""}`}>
            <div className="mypage_submenu_inner">
              {INFO_MENU.map((item) => (
                <button
                  key={item.key}
                  className={`mypage_submenu_item${
                    activeSection === "info" && activeInfoTab === item.key ? " active" : ""
                  }${item.key === "delete" ? " danger" : ""}`}
                  onClick={() => handleSelectInfoTab(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`mypage_nav_item mypage_nav_item_expandable${
              activeSection === "posts" ? " active" : ""
            }`}
            onClick={() => setPostsMenuOpen((v) => !v)}
          >
            게시물
            <span className={`mypage_nav_chevron${postsMenuOpen ? " open" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <div className={`mypage_submenu${postsMenuOpen ? " open" : ""}`}>
            <div className="mypage_submenu_inner">
              {POST_MENU.map((item) => (
                <button
                  key={item.key}
                  className={`mypage_submenu_item${activePostTab === item.key ? " active" : ""}`}
                  onClick={() => handleSelectPostTab(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`mypage_nav_item${activeSection === "analysis" ? " active" : ""}`}
            onClick={() => setActiveSection("analysis")}
          >
            분석기록
          </button>
        </nav>

        {/* 우측 콘텐츠 */}
        <div className="mypage_content">
          {activeSection === "info" && activeInfoTab === "profile" && (
            <section className="card">
              <h2>프로필</h2>
              <div className="info_card_body">
                {profile?.userProfileImage ? (
                  <img
                    src={getProfileImageSrc(profile.userProfileImage)}
                    alt="프로필 사진"
                    className="info_avatar"
                  />
                ) : (
                  <div className="info_avatar_fallback">
                    {(profile?.userId || userId || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="info_text">
                  <div className="info_id">
                    {profileLoading ? "불러오는 중..." : profile?.userId || userId}
                  </div>
                  <div className="info_meta">
                    {profile?.userNickname && (
                      <span className="info_meta_pill">{profile.userNickname}</span>
                    )}
                    {profile?.userCreatedAt && (
                      <span className="info_meta_pill rose">
                        가입일 {profile.userCreatedAt.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === "info" && activeInfoTab === "edit" && (
            <section className="card">
              <h2>정보 수정</h2>
              <form className="mypage_form" onSubmit={handleEditSubmit}>
                <div className="form_avatar_row">
                  {editPreview || profile?.userProfileImage ? (
                    <img
                      src={editPreview || getProfileImageSrc(profile.userProfileImage)}
                      alt="프로필 미리보기"
                      className="info_avatar"
                    />
                  ) : (
                    <div className="info_avatar_fallback">
                      {(profile?.userId || userId || "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <label className="form_file_label">
                    사진 변경
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                </div>

                <div className="form_group">
                  <label className="form_label">닉네임</label>
                  <input
                    className="form_input"
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                  />
                </div>

                {editMessage && (
                  <p className={`form_message ${editMessage.type}`}>{editMessage.text}</p>
                )}

                <div className="form_actions">
                  <button type="submit" className="btn_primary" disabled={editSaving}>
                    {editSaving ? "저장 중..." : "저장하기"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeSection === "info" && activeInfoTab === "password" && (
            <section className="card">
              <h2>비밀번호 변경</h2>
              <form className="mypage_form" onSubmit={handlePasswordSubmit}>
                <div className="form_group">
                  <label className="form_label">현재 비밀번호</label>
                  <input
                    className="form_input"
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    placeholder="현재 비밀번호"
                  />
                </div>
                <div className="form_group">
                  <label className="form_label">새 비밀번호</label>
                  <input
                    className="form_input"
                    type="password"
                    value={pwNext}
                    onChange={(e) => setPwNext(e.target.value)}
                    placeholder="새 비밀번호"
                  />
                </div>
                <div className="form_group">
                  <label className="form_label">새 비밀번호 확인</label>
                  <input
                    className="form_input"
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    placeholder="새 비밀번호 확인"
                  />
                </div>

                {pwMessage && (
                  <p className={`form_message ${pwMessage.type}`}>{pwMessage.text}</p>
                )}

                <div className="form_actions">
                  <button type="submit" className="btn_primary" disabled={pwSaving}>
                    {pwSaving ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeSection === "info" && activeInfoTab === "delete" && (
            <section className="card">
              <h2>회원 탈퇴</h2>
              <div className="danger_box">
                <p className="danger_title">탈퇴 전 꼭 확인해주세요</p>
                <ul className="danger_list">
                  <li>탈퇴 시 내 정보, 게시글, 분석 기록이 모두 삭제되며 복구할 수 없어요.</li>
                  <li>작성한 댓글과 스크랩도 함께 사라져요.</li>
                  <li>동일한 아이디로는 재가입이 제한될 수 있어요.</li>
                </ul>
              </div>

              <label className="danger_checkbox">
                <input
                  type="checkbox"
                  checked={deleteChecked}
                  onChange={(e) => setDeleteChecked(e.target.checked)}
                />
                위 내용을 모두 확인했으며, 탈퇴에 동의합니다.
              </label>

              <div className="form_actions">
                <button
                  className="btn_danger"
                  disabled={!deleteChecked || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "처리 중..." : "회원 탈퇴하기"}
                </button>
              </div>
            </section>
          )}

          {activeSection === "posts" && activePostTab && (
            <section className="card">
              <h2>{POST_MENU.find((t) => t.key === activePostTab)?.label}</h2>

              {activePostTab === "comments" ? (
                commentsLoading && myComments === null ? (
                  <p className="posts_loading">불러오는 중...</p>
                ) : myComments && myComments.length > 0 ? (
                  <ul className="mypage_comments_list">
                    {myComments.map((comment) => (
                      <li
                        key={comment.cmtCode}
                        onClick={() => navigate(`/community/posts/${comment.postCode}`)}
                      >
                        <div className="mypage_comment_top">
                          <div className="mypage_comment_post">{comment.postTitle}</div>
                          <button
                            type="button"
                            onClick={(event) => handleDeleteComment(event, comment.cmtCode)}
                            disabled={deletingCommentCodes[comment.cmtCode]}
                            aria-label="댓글 삭제"
                          >
                            x
                          </button>
                        </div>
                        <p>{comment.contents}</p>
                        <span>
                          {comment.createdAt ? comment.createdAt.slice(0, 10) : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : myComments !== null ? (
                  <p className="posts_empty">아직 작성한 댓글이 없어요.</p>
                ) : null
              ) : (
                (() => {
                  const list = postsByTab[activePostTab];
                  const isLoading = postsLoadingTab[activePostTab];

                  if (isLoading && list === null) {
                    return <p className="posts_loading">불러오는 중...</p>;
                  }
                  if (list && list.length > 0) {
                    return (
                      <ul className="posts_list">
                        {list.map((post) => (
                          <li
                            key={post.postCode}
                            onClick={() => navigate(`/community/posts/${post.postCode}`)}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="posts_list_dot" />
                            <div className="posts_list_text">
                              <div className="posts_list_title">{post.postTitle}</div>
                              <div className="posts_list_meta">
                                {post.postDate ? post.postDate.slice(0, 10) : ""}
                              </div>
                            </div>
                            {activePostTab === "mine" && (
                              <button
                                type="button"
                                className="posts_list_delete"
                                onClick={(event) => handleDeletePost(event, post.postCode)}
                                disabled={deletingPostCodes[post.postCode]}
                              >
                                {deletingPostCodes[post.postCode] ? "삭제 중" : "삭제"}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (list !== null) {
                    return <p className="posts_empty">아직 게시글이 없어요.</p>;
                  }
                  return null;
                })()
              )}
            </section>
          )}

          {activeSection === "analysis" && (
            <section className="card">
                <div className="analysis_card_header">
                <h2>분석 기록(최근 10일 추이)</h2>
                <span className="analysis_card_sub">최근 피부 분석 결과 추이</span>
                </div>
                <AnalysisHistory />
            </section>
            )}
        </div>
      </div>
    </div>
  );
}
