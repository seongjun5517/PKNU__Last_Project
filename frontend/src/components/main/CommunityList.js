import { Link, useNavigate } from "react-router-dom";

const popularPosts = [
  { id: 1, title: "여름철 유수분 밸런스 관리 꿀팁", likes: 128 },
  { id: 2, title: "트러블 진정 루틴 3주 후기", likes: 96 },
  { id: 3, title: "각질 관리, 이 순서로 해보세요", likes: 74 },
];

function CommunityList() {
  const navigate = useNavigate();
  return (
    <section className="card community_card">
      <div className="card_header_row">
        <h2>커뮤니티 인기글</h2>
        <button type="button" className="card_link_button" onClick={() => navigate("/community")}>
          커뮤니티 보러가기 ›
        </button>
      </div>
      <ul className="community_list">
        {popularPosts.map((post, idx) => (
          <li key={post.id}>
            <span className="post_rank">{String(idx + 1).padStart(2, "0")}</span>
            <Link className="post_title" to={`/community/${post.id}`}>
              {post.title}
            </Link>
            <span className="post_likes">♥ {post.likes}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CommunityList;