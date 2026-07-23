import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCommunityPostList } from "../../springApi/communitySpringBootApi";

function CommunityList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCommunityPostList()
      .then((response) => {
        setPosts(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("커뮤니티 인기글 조회 실패:", error);
        setPosts([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const popularPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => {
          const likeDiff = (b.postLike || 0) - (a.postLike || 0);
          if (likeDiff !== 0) return likeDiff;
          return (b.postCode || 0) - (a.postCode || 0);
        })
        .slice(0, 3),
    [posts]
  );

  return (
    <section className="card community_card">
      <div className="card_header_row">
        <h2>커뮤니티 인기글</h2>
        <button type="button" className="card_link_button" onClick={() => navigate("/community")}>
          커뮤니티 보러가기 ›
        </button>
      </div>
      <ul className="community_list">
        {isLoading ? (
          <li className="community_empty">인기글을 불러오는 중입니다.</li>
        ) : popularPosts.length === 0 ? (
          <li className="community_empty">아직 등록된 게시글이 없습니다.</li>
        ) : (
          popularPosts.map((post, idx) => (
            <li key={post.postCode}>
              <span className="post_rank">{String(idx + 1).padStart(2, "0")}</span>
              <Link className="post_title" to={`/community/posts/${post.postCode}`}>
                {post.postTitle}
              </Link>
              <span className="post_likes">♥ {post.postLike || 0}</span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export default CommunityList;
