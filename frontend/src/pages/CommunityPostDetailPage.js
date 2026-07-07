import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCommunityCategoryList,
  getCommunityPost,
} from "../springApi/communitySpringBootApi";
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

  // 상세 화면에 보여줄 게시글 한 건
  const [post, setPost] = useState(null);

  // DB에서 조회한 커뮤니티 카테고리 목록
  const [categories, setCategories] = useState([]);

  // 상세 게시글 조회 중인지 관리
  const [isLoading, setIsLoading] = useState(true);

  // 조회 실패 메시지를 화면에 보여주기 위한 상태
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const [categoryResponse, postResponse] = await Promise.all([
          getCommunityCategoryList(),
          getCommunityPost(postCode),
        ]);

        setCategories(categoryResponse.data);
        setPost(postResponse.data);
      } catch (error) {
        console.error("커뮤니티 게시글 상세 조회 실패:", error);
        setMessage("게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [postCode]);

  const categoryName = useMemo(() => {
    if (!post) return "";

    return (
      categories.find((category) => category.categoryCode === post.categoryCode)
        ?.categoryName || "기타"
    );
  }, [categories, post]);

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
              <span className="community_detail_category">{categoryName}</span>
              <h2>{post.postTitle}</h2>
              <div className="community_detail_meta">
                <span>{post.postUserId}</span>
                <time>{formatPostDate(post.postDate)}</time>
              </div>
            </header>

            <div className="community_detail_content">
              {post.postContent || "내용이 없습니다."}
            </div>

            <footer className="community_detail_metrics">
              <span>조회 {post.postViews}</span>
              <span>추천 {post.postLike}</span>
              <span>스크랩 {post.postScrap}</span>
            </footer>
          </article>
        )}
      </section>
    </main>
  );
}

export default CommunityPostDetailPage;
