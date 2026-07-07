import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function getLoginUserId() {
  return localStorage.getItem("loginUserId");
}

// ---- 알람 관련 부분 ----
// 나중에 DB 연동할 때는 이 함수 내부만 실제 API 호출로 바꾸면 됨.
// 예: const res = await fetch(`/api/notifications?userId=${userId}`);
//     const data = await res.json();
//     return data;
async function fetchNotifications(userId) {
  // TODO: 실제 API 연결 시 아래 목업 데이터 대신 fetch 결과 리턴
  // 알람 데이터 형태 예시:
  // { id, type: "comment" | "like", message, isRead, createdAt }
  return [
    // 목업 데이터 예시 (실제 연동 전까지 테스트용)
    { id: 1, type: "comment", message: "내 게시글에 댓글이 달렸습니다.", isRead: false, createdAt: "2026-07-07T10:00:00" },
    { id: 2, type: "like", message: "내 게시글에 좋아요가 달렸습니다.", isRead: false, createdAt: "2026-07-07T09:00:00" },
  ];
}

function getNotificationText(notification) {
  switch (notification.type) {
    case "comment":
      return notification.message || "내 게시글에 새 댓글이 달렸습니다.";
    case "like":
      return notification.message || "내 게시글에 좋아요를 받았습니다.";
    default:
      return notification.message || "새 알람이 있습니다.";
  }
}

function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = getLoginUserId();
    if (!userId) return;

    fetchNotifications(userId).then((data) => {
      setNotifications(data);
    });

    // 나중에 실시간성이 필요하면 여기서 polling(setInterval)이나
    // websocket 구독을 붙이면 됨.
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem("loginUserId");
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsNotifOpen(false);
  };

  const toggleNotif = () => {
    setIsNotifOpen((prev) => !prev);
    setIsMenuOpen(false); // 알람 열 때 모바일 메뉴는 닫기
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsNotifOpen(false); // 메뉴 열 때 알람창은 닫기
  };

  return (
    <header className="site_header">
      <div className="site_header_top">
        <div
          className="site_header_logo"
          onClick={() => handleNavigate("/main")}
          role="button"
          tabIndex={0}
        >
          <p className="site_header_eyebrow">SKIN DIARY</p>
          <p className="site_header_title">Triple Skin</p>
        </div>

        <div className="site_header_actions">
          {/* 알람 버튼 */}
          <div className="site_header_notification">
            <button
              type="button"
              className="site_header_notification_btn"
              onClick={toggleNotif}
              aria-label="알람 열기"
              aria-expanded={isNotifOpen}
            >
              🔔
              {unreadCount > 0 && (
                <span className="site_header_notification_badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="site_header_notification_dropdown">
                {notifications.length === 0 ? (
                  <p className="site_header_notification_empty">
                    온 알람이 없습니다.
                  </p>
                ) : (
                  <ul className="site_header_notification_list">
                    {notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`site_header_notification_item ${
                          notif.isRead ? "is_read" : ""
                        }`}
                      >
                        <span className="site_header_notification_type">
                          {notif.type === "comment" ? "💬" : "❤️"}
                        </span>
                        <span className="site_header_notification_text">
                          {getNotificationText(notif)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 모바일 토글 버튼 */}
          <button
            type="button"
            className={`site_header_toggle ${isMenuOpen ? "is_open" : ""}`}
            onClick={toggleMenu}
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
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