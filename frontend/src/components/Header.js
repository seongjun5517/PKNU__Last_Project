import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function getLoginUserId() {
  return localStorage.getItem("loginUserId");
}

function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("loginUserId");
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false); // 이동 후 메뉴 자동 닫기
  };

  return (
    <header className="site_header">
      <div className="site_header_top">
        <div
          className="site_header_logo"
          onClick={() => handleNavigate("/")}
          role="button"
          tabIndex={0}
        >
          <p className="site_header_eyebrow">SKIN DIARY</p>
          <p className="site_header_title">Triple Skin</p>
        </div>

        {/* 모바일 토글 버튼 */}
        <button
          type="button"
          className={`site_header_toggle ${isMenuOpen ? "is_open" : ""}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className={`site_header_nav ${isMenuOpen ? "is_open" : ""}`}>
        <button type="button" onClick={() => handleNavigate("/community")}>
          커뮤니티 바로가기
        </button>
        <button type="button" onClick={() => handleNavigate("/analysis")}>
          피부 타입 분석하러 가기
        </button>
        <button type="button" onClick={() => handleNavigate("/analysis1")}>
          피부 상태 분석하러 가기
        </button>
        <button type="button" onClick={() => handleNavigate("/mypage")}>
          마이페이지
        </button>
        <button type="button" className="logout_button" onClick={handleLogout}>
          로그아웃
        </button>
      </nav>
    </header>
  );
}

export default Header;