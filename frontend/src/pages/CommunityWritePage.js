import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCommunityCategoryList,
  insertCommunityPost,
} from "../springApi/communitySpringBootApi";
import { useAuth } from "../context/AuthContext";
import "./CommunityWritePage.css";

function CommunityWritePage() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // DB에서 조회한 커뮤니티 카테고리 목록
  const [categories, setCategories] = useState([]);

  // 작성 페이지에서 선택한 카테고리 코드
  const [categoryCode, setCategoryCode] = useState("");

  // 작성 중인 게시글 제목
  const [postTitle, setPostTitle] = useState("");

  // 작성 중인 게시글 본문
  const [postContent, setPostContent] = useState("");

  // 저장 요청 중인지 관리해서 중복 등록 막기
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 저장 실패나 입력 오류 메시지를 화면에 보여주기 위한 상태
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCommunityCategoryList();
        const categoryList = response.data;

        setCategories(categoryList);
        if (categoryList.length > 0) {
          setCategoryCode(categoryList[0].categoryCode);
        }
      } catch (error) {
        console.error("커뮤니티 카테고리 조회 실패:", error);
        setMessage("카테고리 목록을 불러오지 못했습니다.");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      setMessage("로그인 정보가 없습니다. 로그인 후 다시 작성해주세요.");
      return;
    }

    if (!postTitle.trim()) {
      setMessage("제목을 입력해주세요.");
      return;
    }

    if (!postContent.trim()) {
      setMessage("내용을 입력해주세요.");
      return;
    }

    if (!categoryCode) {
      setMessage("카테고리를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await insertCommunityPost({
        categoryCode: Number(categoryCode),
        postTitle: postTitle.trim(),
        postContent: postContent.trim(),
      });

      navigate("/community");
    } catch (error) {
      console.error("커뮤니티 게시글 등록 실패:", error);
      setMessage("게시글 등록에 실패했습니다. 백엔드 서버와 DB 상태를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="community_write_page">
      <section className="community_write_shell">
        <div className="community_write_topbar">
          <div>
            <p className="community_write_eyebrow">BEAUTY COMMUNITY</p>
            <h1>새 게시글 작성</h1>
          </div>
          <button type="button" onClick={() => navigate("/community")}>
            목록으로
          </button>
        </div>

        <form className="community_write_form" onSubmit={handleSubmit}>
          <label>
            카테고리
            <select
              value={categoryCode}
              onChange={(event) => setCategoryCode(event.target.value)}
              disabled={categories.length === 0}
            >
              {categories.map((category) => (
                <option key={category.categoryCode} value={category.categoryCode}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </label>

          <label>
            제목
            <input
              type="text"
              value={postTitle}
              onChange={(event) => setPostTitle(event.target.value)}
              placeholder="제목을 입력하세요"
            />
          </label>

          <label>
            내용
            <textarea
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              placeholder="내용을 입력하세요"
              rows={14}
            />
          </label>

          {message && <p className="community_write_message">{message}</p>}

          <div className="community_write_actions">
            <button type="button" onClick={() => navigate("/community")}>
              취소
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CommunityWritePage;
