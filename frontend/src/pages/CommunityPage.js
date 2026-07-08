import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCommunityCategoryList,
  getCommunityPostList,
  getCommunityPostScrapStatus,
  scrapCommunityPost,
} from "../springApi/communitySpringBootApi";
import "./CommunityPage.css";

const boardTabs = ["전체", "HOT", "정보/소식", "팁/자료", "기타", "댓글없는글"];

// "2026-07-07 15:30:00" 이 데이터를 >> 7.7 15:30 이렇게 보여주는 함수
function formatPostDate(value) {
  if (!value) return "";

  const [, month, day, hour, minute] =
    String(value).match(/\d{4}-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/) || [];

  if (!month) return value;
  return `${Number(month)}.${Number(day)} ${hour}:${minute}`;
}

function CommunityPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const loginUserId =
    userId || localStorage.getItem("userId") || localStorage.getItem("loginUserId");

  // 현재 선택된 게시판 카테고리. "all"이면 전체 카테고리
  const [selectedCategoryCode, setSelectedCategoryCode] = useState("all");

  // 게시글 목록 상단- 탭 필터 상태
  const [activeTab, setActiveTab] = useState("전체");

  // 입력된 검색어
  const [keyword, setKeyword] = useState("");

  // 게시글 정렬 기준 >> lates 최신순, popular 추천순, views 조회순
  const [sortType, setSortType] = useState("latest");

  // 게시글 목록. 백엔드에서 받아온 게시글 배열 저장
  const [posts, setPosts] = useState([]);

  // DB에서 조회한 커뮤니티 카테고리 목록
  const [categories, setCategories] = useState([]);
  const [scrappedPostCodes, setScrappedPostCodes] = useState({});
  const [scrappingPostCodes, setScrappingPostCodes] = useState({});

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const [categoryResponse, postResponse] = await Promise.all([
          getCommunityCategoryList(),
          getCommunityPostList(),
        ]);
        const postList = postResponse.data;

        setCategories(categoryResponse.data);
        setPosts(postList);

        if (loginUserId) {
          const scrapStatuses = await Promise.all(
            postList.map((post) =>
              getCommunityPostScrapStatus(post.postCode, loginUserId)
                .then((response) => [post.postCode, Boolean(response.data)])
                .catch(() => [post.postCode, false])
            )
          );

          setScrappedPostCodes(Object.fromEntries(scrapStatuses));
        } else {
          setScrappedPostCodes({});
        }
      } catch (error) {
        console.error("커뮤니티 데이터 조회 실패:", error);
      }
    };

    fetchCommunityData();
  }, [loginUserId]);

  const filteredPosts = useMemo(() => {
    const searchKeyword = keyword.trim().toLowerCase();
    const getCategoryName = (categoryCode) =>
      categories.find((category) => category.categoryCode === categoryCode)
        ?.categoryName || "기타";

    const list = posts.filter((post) => {
      const categoryMatched =
        selectedCategoryCode === "all" || post.categoryCode === selectedCategoryCode;
      const tabMatched =
        activeTab === "전체" ||
        post.tag === activeTab ||
        (activeTab === "댓글없는글" && (post.commentCount || 0) === 0);

      // 검색기능 비어있으면 전체 보여줌.
      const keywordMatched =
        !searchKeyword ||
        post.postTitle.toLowerCase().includes(searchKeyword) ||
        (post.postContent || "").toLowerCase().includes(searchKeyword) ||
        getCategoryName(post.categoryCode).toLowerCase().includes(searchKeyword);

      return categoryMatched && tabMatched && keywordMatched;
    });

    return [...list].sort((a, b) => {
      if (sortType === "popular") return (b.postLike || 0) - (a.postLike || 0);
      if (sortType === "views") return (b.postViews || 0) - (a.postViews || 0);
      return (b.postCode || 0) - (a.postCode || 0);
    });
  }, [activeTab, categories, keyword, posts, selectedCategoryCode, sortType]);

  const getCategoryName = (categoryCode) =>
    categories.find((category) => category.categoryCode === categoryCode)
      ?.categoryName || "기타";

  const handleScrapClick = async (postCode) => {
    if (!loginUserId) {
      alert("로그인 후 스크랩할 수 있습니다.");
      return;
    }

    if (scrappingPostCodes[postCode]) return;

    setScrappingPostCodes((current) => ({ ...current, [postCode]: true }));

    try {
      const response = await scrapCommunityPost(postCode, loginUserId);

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.postCode === postCode ? response.data.post : post
        )
      );
      setScrappedPostCodes((current) => ({
        ...current,
        [postCode]: response.data.scrapped,
      }));
    } catch (error) {
      console.error("커뮤니티 게시글 스크랩 실패:", error.response?.data || error);
      alert("스크랩 반영에 실패했습니다.");
    } finally {
      setScrappingPostCodes((current) => ({ ...current, [postCode]: false }));
    }
  };

  return (
    <main className="community_page">
      <section className="community_shell">
        <div className="community_topbar">
          <div>
            <p className="community_eyebrow">BEAUTY COMMUNITY</p>
            <h1>뷰티 게시판</h1>
          </div>
          <button
            type="button"
            className="community_write_button"
            onClick={() => navigate("/community/write")}
          >
            글쓰기
          </button>
        </div>

        <div className="community_category_grid" aria-label="게시글 카테고리">
          <button
            type="button"
            className={selectedCategoryCode === "all" ? "active" : ""}
            onClick={() => setSelectedCategoryCode("all")}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.categoryCode}
              className={selectedCategoryCode === category.categoryCode ? "active" : ""}
              onClick={() => setSelectedCategoryCode(category.categoryCode)}
            >
              {category.categoryName}
            </button>
          ))}
        </div>

        <div className="community_board">
          <div className="community_board_toolbar">
            <div className="community_tabs" role="tablist" aria-label="게시글 필터">
              {boardTabs.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="community_search_group">
              <select
                value={sortType}
                onChange={(event) => setSortType(event.target.value)}
                aria-label="정렬"
              >
                <option value="latest">최신순</option>
                <option value="popular">추천순</option>
                <option value="views">조회순</option>
              </select>
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="게시글 검색"
              />
            </div>
          </div>

          <section className="post_table" aria-label="게시글 목록">
            <div className="post_table_head">
              <span>번호</span>
              <span>카테고리</span>
              <span>제목</span>
              <span>반응</span>
              <span>작성일</span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="post_empty">등록된 게시글이 없습니다.</div>
            ) : (
              filteredPosts.map((post) => (
                <article className="post_row" key={post.postCode}>
                  <span className="post_code">#{post.postCode}</span>
                  <span className="post_category">{getCategoryName(post.categoryCode)}</span>
                  <div className="post_summary">
                    <button
                      type="button"
                      className="post_title_button"
                      onClick={() => navigate(`/community/posts/${post.postCode}`)}
                    >
                      {post.postTitle}
                      {post.commentCount > 0 && (
                        <span className="post_comment_count">[{post.commentCount}]</span>
                      )}
                    </button>
                    <p>{post.postContent}</p>
                    <span className="post_writer">{post.postUserId}</span>
                  </div>
                  <div className="post_metrics">
                    <span>조회 {post.postViews}</span>
                    <span>조화효~ {post.postLike}</span>
                    <button
                      type="button"
                      className={`post_scrap_button${
                        scrappedPostCodes[post.postCode] ? " is_scrapped" : ""
                      }`}
                      onClick={() => handleScrapClick(post.postCode)}
                      disabled={scrappingPostCodes[post.postCode]}
                    >
                      {scrappingPostCodes[post.postCode]
                        ? "반영 중..."
                        : `${scrappedPostCodes[post.postCode] ? "스크랩됨" : "스크랩"} ${
                            post.postScrap || 0
                          }`}
                    </button>
                  </div>
                  <time>{formatPostDate(post.postDate)}</time>
                </article>
              ))
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default CommunityPage;
