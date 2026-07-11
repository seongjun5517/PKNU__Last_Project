import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createCommunityPostComment,
  createCommunityPostReport,
  deleteCommunityComment,
  deleteCommunityPost,
  getCommunityCategoryList,
  getCommunityPost,
  getCommunityPostComments,
  getCommunityPostLikeStatus,
  getCommunityPostReportCount,
  getCommunityPostReports,
  getCommunityPostScrapStatus,
  increaseCommunityPostView,
  likeCommunityPost,
  scrapCommunityPost,
  resolveCommunityPostReports,
  updateCommunityPost,
} from "../springApi/communitySpringBootApi";
import { springApi } from "../config/axiosInstance";
import { getProfileImageSrc } from "../utils/profileImage";
import "./CommunityPostDetailPage.css";

function formatPostDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR");
}

function CommunityPostDetailPage() {
  const navigate = useNavigate();
  const { postCode } = useParams();
  const { userId, adminMode } = useAuth();
  const loginUserId =
    userId || localStorage.getItem("userId") || localStorage.getItem("loginUserId");

  // 상세 화면에 보여줄 게시물 정보
  const [post, setPost] = useState(null);

  // DB에서 조회한 커뮤니티 카테고리 목록
  const [categories, setCategories] = useState([]);

  // 상세 게시물 조회 중인지 관리
  const [isLoading, setIsLoading] = useState(true);

  // 조회 실패 메시지를 화면에 보여주기 위한 상태
  const [message, setMessage] = useState("");

  // 좋아요 요청이 중복으로 눌리지 않게 막기 위한 상태
  const [isLiking, setIsLiking] = useState(false);

  // 좋아요 요청 실패 메시지를 보여주기 위한 상태
  const [likeMessage, setLikeMessage] = useState("");

  // 로그인 사용자가 현재 게시물에 좋아요를 눌렀는지 관리
  const [isLiked, setIsLiked] = useState(false);
  const [isScrapping, setIsScrapping] = useState(false);
  const [scrapMessage, setScrapMessage] = useState("");
  const [isScrapped, setIsScrapped] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [isCommentSaving, setIsCommentSaving] = useState(false);
  const [deletingCommentCodes, setDeletingCommentCodes] = useState({});
  const [commentMessage, setCommentMessage] = useState("");
  const [authorProfile, setAuthorProfile] = useState(null);
  const [authorImageError, setAuthorImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryCode, setEditCategoryCode] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isPostDeleting, setIsPostDeleting] = useState(false);
  const [postActionMessage, setPostActionMessage] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportCount, setReportCount] = useState(0);
  const [reports, setReports] = useState([]);
  const [isReportListOpen, setIsReportListOpen] = useState(false);
  const [isReportListLoading, setIsReportListLoading] = useState(false);
  const [isReportResolving, setIsReportResolving] = useState(false);
  const [reportListMessage, setReportListMessage] = useState("");

  const reportReasons = [
    { value: "SPAM_ADVERTISING", label: "스팸 또는 광고성 게시물" },
    { value: "ABUSE_HARASSMENT", label: "욕설, 비방 또는 괴롭힘" },
    { value: "HATE_DISCRIMINATION", label: "혐오 또는 차별 표현" },
    { value: "INAPPROPRIATE_CONTENT", label: "음란하거나 부적절한 내용" },
  ];

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const requests = [
          getCommunityCategoryList(),
          getCommunityPost(postCode),
          getCommunityPostComments(postCode),
        ];

        if (loginUserId) {
          requests.push(getCommunityPostLikeStatus(postCode, loginUserId));
          requests.push(getCommunityPostScrapStatus(postCode, loginUserId));
        }

        const [
          categoryResponse,
          postResponse,
          commentResponse,
          likeStatusResponse,
          scrapStatusResponse,
        ] =
          await Promise.all(requests);
        const postData = postResponse.data;

        setCategories(categoryResponse.data);
        setComments(commentResponse.data || []);
        setIsLiked(Boolean(likeStatusResponse?.data));
        setIsScrapped(Boolean(scrapStatusResponse?.data));

        const viewSessionKey = `community:viewed:${postCode}:${loginUserId}`;
        const shouldIncreaseView =
          loginUserId &&
          postData?.postUserId !== loginUserId &&
          !sessionStorage.getItem(viewSessionKey);

        if (shouldIncreaseView) {
          sessionStorage.setItem(viewSessionKey, "true");

          try {
            const viewResponse = await increaseCommunityPostView(postCode, loginUserId);
            setPost(viewResponse.data);
          } catch (viewError) {
            sessionStorage.removeItem(viewSessionKey);
            console.error("而ㅻ??덊떚 寃뚯떆湲 議고쉶??利앷? ?ㅽ뙣:", viewError);
            setPost(postData);
          }
        } else {
          setPost(postData);
        }
      } catch (error) {
        console.error("커뮤니티 게시글 상세 조회 실패:", error);
        setMessage("게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [postCode, loginUserId]);

  useEffect(() => {
    if (!post) return;

    setEditCategoryCode(post.categoryCode || "");
    setEditTitle(post.postTitle || "");
    setEditContent(post.postContent || "");
  }, [post]);

  useEffect(() => {
    if (!adminMode || !postCode) {
      setReportCount(0);
      return;
    }

    if (!loginUserId) {
      setReportCount(0);
      return;
    }

    getCommunityPostReportCount(postCode, loginUserId)
      .then((response) => setReportCount(response.data?.count || 0))
      .catch((error) => {
        console.error("신고 수 조회 실패:", error);
        setReportCount(0);
      });
  }, [adminMode, postCode, loginUserId]);

  useEffect(() => {
    if (!post?.postUserId) {
      setAuthorProfile(null);
      return;
    }

    let isMounted = true;
    const loadAuthorProfile = () => {
      setAuthorImageError(false);

      springApi
        .get(`/user/${post.postUserId}`)
        .then((response) => {
          if (isMounted) {
            setAuthorProfile(response.data);
          }
        })
        .catch((error) => {
          console.error("게시글 작성자 프로필 조회 실패:", error);
          if (isMounted) {
            setAuthorProfile(null);
          }
        });
    };

    const handleProfileUpdated = (event) => {
      if (!event.detail?.userId || event.detail.userId === post.postUserId) {
        loadAuthorProfile();
      }
    };

    loadAuthorProfile();
    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [post?.postUserId]);

  const categoryName = useMemo(() => {
    if (!post) return "";

    return (
      categories.find((category) => category.categoryCode === post.categoryCode)
        ?.categoryName || "기타"
    );
  }, [categories, post]);
  const isOwnPost = Boolean(post && loginUserId && post.postUserId === loginUserId);
  const canDeletePost = isOwnPost || adminMode;
  const authorDisplayName = authorProfile?.userNickname || post?.postUserId || "";
  const authorInitial = (authorDisplayName || "?").slice(0, 1).toUpperCase();
  const authorProfileImage =
    !authorImageError ? getProfileImageSrc(authorProfile?.userProfileImage) : null;

  const handleLikeClick = async () => {
    if (!post || isLiking) return;

    if (!loginUserId) {
      setLikeMessage("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    setIsLiking(true);
    setLikeMessage("");

    try {
      const response = await likeCommunityPost(post.postCode, loginUserId);
      setPost(response.data.post);
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("커뮤니티 게시글 좋아요 실패:", error);
      setLikeMessage("좋아요 반영에 실패했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleScrapClick = async () => {
    if (!post || isScrapping) return;

    if (!loginUserId) {
      setScrapMessage("로그인 후 스크랩할 수 있습니다.");
      return;
    }

    setIsScrapping(true);
    setScrapMessage("");

    try {
      const response = await scrapCommunityPost(post.postCode, loginUserId);
      setPost(response.data.post);
      setIsScrapped(response.data.scrapped);
    } catch (error) {
      console.error("커뮤니티 게시글 스크랩 실패:", error.response?.data || error);
      setScrapMessage("스크랩 반영에 실패했습니다.");
    } finally {
      setIsScrapping(false);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = commentContent.trim();
    if (!trimmedContent || isCommentSaving) return;

    if (!loginUserId) {
      setCommentMessage("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    setIsCommentSaving(true);
    setCommentMessage("");

    try {
      const response = await createCommunityPostComment(
        post.postCode,
        loginUserId,
        trimmedContent
      );
      setComments((currentComments) => [...currentComments, response.data]);
      setCommentContent("");
    } catch (error) {
      console.error("커뮤니티 댓글 작성 실패:", error.response?.data || error);
      setCommentMessage("댓글 저장에 실패했습니다.");
    } finally {
      setIsCommentSaving(false);
    }
  };

  const handleCommentDelete = async (commentCode) => {
    if (!loginUserId || deletingCommentCodes[commentCode]) return;

    setDeletingCommentCodes((current) => ({ ...current, [commentCode]: true }));
    setCommentMessage("");

    try {
      await deleteCommunityComment(commentCode, loginUserId);
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.cmtCode !== commentCode)
      );
    } catch (error) {
      console.error("커뮤니티 댓글 삭제 실패:", error.response?.data || error);
      setCommentMessage("댓글 삭제에 실패했습니다.");
    } finally {
      setDeletingCommentCodes((current) => ({ ...current, [commentCode]: false }));
    }
  };

  const handleEditStart = () => {
    if (!post) return;

    setEditCategoryCode(post.categoryCode || "");
    setEditTitle(post.postTitle || "");
    setEditContent(post.postContent || "");
    setPostActionMessage("");
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    if (!post) return;

    setEditCategoryCode(post.categoryCode || "");
    setEditTitle(post.postTitle || "");
    setEditContent(post.postContent || "");
    setPostActionMessage("");
    setIsEditing(false);
  };

  const handlePostUpdate = async (event) => {
    event.preventDefault();

    if (!post || isPostSaving) return;
    if (!loginUserId) {
      setPostActionMessage("로그인 후 게시글을 수정할 수 있습니다.");
      return;
    }
    if (!editTitle.trim()) {
      setPostActionMessage("제목을 입력해주세요.");
      return;
    }
    if (!editContent.trim()) {
      setPostActionMessage("내용을 입력해주세요.");
      return;
    }
    if (!editCategoryCode) {
      setPostActionMessage("카테고리를 선택해주세요.");
      return;
    }

    setIsPostSaving(true);
    setPostActionMessage("");

    try {
      const response = await updateCommunityPost(post.postCode, {
        postUserId: loginUserId,
        categoryCode: Number(editCategoryCode),
        postTitle: editTitle.trim(),
        postContent: editContent.trim(),
      });

      setPost(response.data);
      setIsEditing(false);
      setPostActionMessage("게시글이 수정되었습니다.");
    } catch (error) {
      console.error("커뮤니티 게시글 수정 실패:", error.response?.data || error);
      setPostActionMessage("게시글 수정에 실패했습니다.");
    } finally {
      setIsPostSaving(false);
    }
  };

  const handlePostDelete = async () => {
    if (!post || isPostDeleting) return;
    if (!loginUserId) {
      setPostActionMessage("로그인 후 게시글을 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm("게시글을 삭제할까요? 삭제 후에는 복구할 수 없습니다.")) {
      return;
    }

    setIsPostDeleting(true);
    setPostActionMessage("");

    try {
      await deleteCommunityPost(post.postCode, loginUserId);
      navigate("/community");
    } catch (error) {
      console.error("커뮤니티 게시글 삭제 실패:", error.response?.data || error);
      setPostActionMessage("게시글 삭제에 실패했습니다.");
      setIsPostDeleting(false);
    }
  };

  const handleReportOpen = () => {
    if (!loginUserId) {
      setPostActionMessage("로그인 후 신고할 수 있습니다.");
      return;
    }

    setReportReason("");
    setReportMessage("");
    setIsReportOpen(true);
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();

    if (!post || !reportReason || isReporting) return;

    setIsReporting(true);
    setReportMessage("");

    try {
      await createCommunityPostReport(post.postCode, loginUserId, reportReason);
      setIsReportOpen(false);
      setPostActionMessage("신고가 접수되었습니다.");
    } catch (error) {
      if (error.response?.status === 409) {
        setReportMessage("이미 신고한 게시물입니다.");
      } else if (error.response?.status === 403) {
        setReportMessage("본인이 작성한 게시물은 신고할 수 없습니다.");
      } else {
        setReportMessage("신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsReporting(false);
    }
  };

  const getReportReasonLabel = (reason) =>
    reportReasons.find((item) => item.value === reason)?.label || reason;

  const handleReportListOpen = async () => {
    if (!post || !loginUserId || isReportListLoading) return;

    setIsReportListOpen(true);
    setIsReportListLoading(true);
    setReportListMessage("");

    try {
      const response = await getCommunityPostReports(post.postCode, loginUserId);
      setReports(response.data || []);
    } catch (error) {
      console.error("신고 목록 조회 실패:", error);
      setReportListMessage("신고 목록을 불러오지 못했습니다.");
    } finally {
      setIsReportListLoading(false);
    }
  };

  const handleReportResolve = async (decision) => {
    if (!post || !loginUserId || isReportResolving) return;

    if (
      decision === "DELETE" &&
      !window.confirm("신고된 게시글을 삭제하시겠습니까? 작성자에게 삭제 알림이 전송됩니다.")
    ) {
      return;
    }

    setIsReportResolving(true);
    setReportListMessage("");

    try {
      await resolveCommunityPostReports(post.postCode, loginUserId, decision);

      if (decision === "DELETE") {
        navigate("/community");
        return;
      }

      setReports([]);
      setReportCount(0);
      setIsReportListOpen(false);
      setPostActionMessage("신고를 유지 결정으로 처리했습니다.");
    } catch (error) {
      console.error("신고 처리 실패:", error);
      setReportListMessage("신고 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsReportResolving(false);
    }
  };

  return (
    <main className="community_detail_page">
      <section className="community_detail_shell">
        <div className="community_detail_topbar">
          <div>
            <p className="community_detail_eyebrow">BEAUTY COMMUNITY</p>
            <h1>게시글</h1>
          </div>
          <button type="button" onClick={() => navigate("/community")}>
            목록으로
          </button>
        </div>

        {isLoading ? (
          <div className="community_detail_state">게시글을 불러오는 중입니다.</div>
        ) : message ? (
          <div className="community_detail_state">{message}</div>
        ) : (
          <article className="community_detail_card">
            <header className="community_detail_header">
              {isEditing ? (
                <form className="community_detail_edit_form" onSubmit={handlePostUpdate}>
                  <label>
                    카테고리
                    <select
                      value={editCategoryCode}
                      onChange={(event) => setEditCategoryCode(event.target.value)}
                      disabled={categories.length === 0}
                    >
                      {categories.map((category) => (
                        <option
                          key={category.categoryCode}
                          value={category.categoryCode}
                        >
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    제목
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                    />
                  </label>

                  <label>
                    내용
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={12}
                    />
                  </label>

                  <div className="community_detail_owner_actions">
                    <button type="button" onClick={handleEditCancel}>
                      취소
                    </button>
                    <button type="submit" disabled={isPostSaving}>
                      {isPostSaving ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="community_detail_header_top">
                    <span className="community_detail_category">{categoryName}</span>
                    {canDeletePost && (
                      <div className="community_detail_owner_actions">
                        {isOwnPost && (
                          <button type="button" onClick={handleEditStart}>
                            수정
                          </button>
                        )}
                        <button
                          type="button"
                          className="danger"
                          onClick={handlePostDelete}
                          disabled={isPostDeleting}
                        >
                          {isPostDeleting ? "삭제 중..." : "삭제"}
                        </button>
                      </div>
                    )}
                  </div>

                  <h2>{post.postTitle}</h2>
                  <div className="community_detail_meta">
                    <span className="community_detail_author">
                      {authorProfileImage ? (
                        <img
                          src={authorProfileImage}
                          alt=""
                          className="community_detail_author_img"
                          onError={() => setAuthorImageError(true)}
                        />
                      ) : (
                        <span className="community_detail_author_fallback">
                          {authorInitial}
                        </span>
                      )}
                      <span>{authorDisplayName}</span>
                    </span>
                    <time>{formatPostDate(post.postDate)}</time>
                  </div>
                </>
              )}
            </header>

            {!isEditing && (
              <div className="community_detail_content">
                {post.postContent || "내용이 없습니다."}
              </div>
            )}

            <footer className="community_detail_metrics">
              <span>조회 {post.postViews || 0}</span>
              <button
                type="button"
                className={`community_detail_like_button${
                  isLiked ? " is_liked" : ""
                }`}
                onClick={handleLikeClick}
                disabled={isLiking}
              >
                {isLiking
                  ? "반영 중..."
                  : `${isLiked ? "🧡" : "♡"} ${post.postLike || 0}`}
              </button>
              <button
                type="button"
                className={`community_detail_scrap_button${
                  isScrapped ? " is_scrapped" : ""
                }`}
                onClick={handleScrapClick}
                disabled={isScrapping}
              >
                {isScrapping
                  ? "반영 중..."
                  : `${isScrapped ? "스크랩됨" : "스크랩"} ${post.postScrap || 0}`}
              </button>
              {adminMode ? (
                <button
                  type="button"
                  className="community_detail_report_count"
                  onClick={handleReportListOpen}
                >
                  신고 {reportCount}
                </button>
              ) : !isOwnPost && (
                <button
                  type="button"
                  className="community_detail_report_button"
                  onClick={handleReportOpen}
                >
                  신고
                </button>
              )}
            </footer>

            {likeMessage && (
              <p className="community_detail_action_message">{likeMessage}</p>
            )}
            {scrapMessage && (
              <p className="community_detail_action_message">{scrapMessage}</p>
            )}
            {postActionMessage && (
              <p className="community_detail_action_message">{postActionMessage}</p>
            )}

            <section className="community_comment_section">
              <div className="community_comment_header">
                <h3>댓글</h3>
                <span>{comments.length}</span>
              </div>

              {comments.length === 0 ? (
                <p className="community_comment_empty">아직 댓글이 없습니다.</p>
              ) : (
                <ul className="community_comment_list">
                  {comments.map((comment) => (
                    <li key={comment.cmtCode}>
                      <div className="community_comment_meta">
                        <strong>{comment.cmtUserId}</strong>
                        <div className="community_comment_meta_right">
                          <time>{formatPostDate(comment.cmtCreatedAt)}</time>
                          {(comment.cmtUserId === loginUserId || adminMode) && (
                            <button
                              type="button"
                              onClick={() => handleCommentDelete(comment.cmtCode)}
                              disabled={deletingCommentCodes[comment.cmtCode]}
                              aria-label="댓글 삭제"
                            >
                              x
                            </button>
                          )}
                        </div>
                      </div>
                      <p>{comment.cmtContents}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form className="community_comment_form" onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  placeholder="댓글을 입력하세요."
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={isCommentSaving || !commentContent.trim()}
                >
                  {isCommentSaving ? "저장 중..." : "댓글 작성"}
                </button>
              </form>

              {commentMessage && (
                <p className="community_detail_action_message">{commentMessage}</p>
              )}
            </section>
          </article>
        )}
      </section>
      {isReportOpen && (
        <div className="community_report_modal_backdrop" role="presentation">
          <form className="community_report_modal" onSubmit={handleReportSubmit}>
            <div className="community_report_modal_head">
              <h2>게시물 신고</h2>
              <button
                type="button"
                className="community_report_modal_close"
                onClick={() => setIsReportOpen(false)}
                aria-label="신고 창 닫기"
              >
                x
              </button>
            </div>
            <div className="community_report_reason_list">
              {reportReasons.map((reason) => (
                <label key={reason.value} className="community_report_reason">
                  <input
                    type="checkbox"
                    checked={reportReason === reason.value}
                    onChange={() => setReportReason(reason.value)}
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
            {reportMessage && <p className="community_report_message">{reportMessage}</p>}
            <div className="community_report_modal_actions">
              <button type="button" onClick={() => setIsReportOpen(false)}>
                취소
              </button>
              <button type="submit" disabled={!reportReason || isReporting}>
                {isReporting ? "접수 중..." : "신고하기"}
              </button>
            </div>
          </form>
        </div>
      )}
      {isReportListOpen && (
        <div className="community_report_modal_backdrop" role="presentation">
          <section className="community_report_modal community_report_admin_modal">
            <div className="community_report_modal_head">
              <div>
                <h2>신고 관리</h2>
                <p className="community_report_post_title">{post?.postTitle}</p>
              </div>
              <button
                type="button"
                className="community_report_modal_close"
                onClick={() => setIsReportListOpen(false)}
                aria-label="신고 목록 닫기"
              >
                x
              </button>
            </div>

            {isReportListLoading ? (
              <p className="community_report_admin_state">신고 목록을 불러오는 중입니다.</p>
            ) : reportListMessage ? (
              <p className="community_report_message">{reportListMessage}</p>
            ) : reports.length === 0 ? (
              <p className="community_report_admin_state">접수된 신고가 없습니다.</p>
            ) : (
              <ul className="community_report_admin_list">
                {reports.map((report) => (
                  <li key={report.reportCode}>
                    <div>
                      <strong>{report.reportUserId}</strong>
                      <span>{getReportReasonLabel(report.reportReason)}</span>
                    </div>
                    <time>{formatPostDate(report.reportCreatedAt)}</time>
                  </li>
                ))}
              </ul>
            )}

            <div className="community_report_modal_actions">
              <button
                type="button"
                onClick={() => handleReportResolve("KEEP")}
                disabled={isReportResolving || reports.length === 0}
              >
                유지 결정
              </button>
              <button
                type="button"
                className="community_report_delete_action"
                onClick={() => handleReportResolve("DELETE")}
                disabled={isReportResolving || reports.length === 0}
              >
                {isReportResolving ? "처리 중..." : "게시글 삭제"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default CommunityPostDetailPage;
