import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { springApi } from "../config/axiosInstance";
import {
  deleteNotification,
  deleteReadNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../springApi/notificationSpringBootApi";
import { getProfileImageSrc } from "../utils/profileImage";
import "./Header.css";

const NOTIFICATION_POLLING_INTERVAL = 15000;

function normalizeNotification(notification) {
  return {
    id: notification.notiCode,
    type: String(notification.notiType || "").toLowerCase(),
    message: notification.message,
    isRead: Boolean(notification.notiIsRead),
    createdAt: notification.notiCreatedAt,
    postCode: notification.notiPostCode,
    cmtCode: notification.notiCmtCode,
  };
}

function getNotificationText(notification) {
  switch (notification.type) {
    case "comment":
      return notification.message || "내 게시글에 새 댓글이 달렸습니다.";
    case "like":
      return notification.message || "내 게시글에 좋아요를 받았습니다.";
    case "report_deleted":
      return "신고로 인해 작성한 게시글이 삭제되었습니다.";
    case "report":
      return "새 게시물 신고가 접수되었습니다.";
    default:
      return notification.message || "새 알람이 있습니다.";
  }
}

function formatNotificationTime(createdAt) {
  if (!createdAt) {
    return "";
  }

  return new Date(createdAt).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Header() {
  const navigate = useNavigate();
  const {
    userId: authUserId,
    logout,
    isSuperAdmin,
    adminMode,
    toggleAdminMode,
  } = useAuth();
  const currentUserId = authUserId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileImageError, setProfileImageError] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }

    try {
      const res = await getNotifications();
      setNotifications((res.data || []).map(normalizeNotification));
    } catch (err) {
      console.error("알림 조회 실패:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadNotifications();

    if (!currentUserId) {
      return undefined;
    }

    const pollingId = window.setInterval(
      loadNotifications,
      NOTIFICATION_POLLING_INTERVAL
    );

    return () => window.clearInterval(pollingId);
  }, [currentUserId, loadNotifications]);

  useEffect(() => {
    if (!currentUserId) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    const loadProfile = () => {
      setProfileImageError(false);

      springApi
        .get(`/user/me`)
        .then((res) => {
          if (isMounted) {
            setProfile(res.data);
          }
        })
        .catch((err) => console.error("헤더 프로필 조회 실패:", err));
    };

    loadProfile();
    window.addEventListener("profile-updated", loadProfile);

    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, [currentUserId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const profileImage = !profileImageError
    ? getProfileImageSrc(profile?.userProfileImage)
    : null;
  const profileInitial = (profile?.userNickname || currentUserId || "?")
    .slice(0, 1)
    .toUpperCase();

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  };

  const toggleNotif = () => {
    setIsNotifOpen((prev) => !prev);
    setIsMenuOpen(false); // 알람 열 때 모바일 메뉴는 닫기
    setIsProfileOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsNotifOpen(false); // 메뉴 열 때 알람창은 닫기
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotifOpen(false);
    setIsMenuOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!currentUserId) {
      return;
    }

    if (!notification.isRead) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
      } catch (err) {
        console.error("알림 읽음 처리 실패:", err);
      }
    }

    if (notification.postCode) {
      handleNavigate(`/community/posts/${notification.postCode}`);
    }
  };

  const handleDeleteNotification = async (event, notiCode) => {
    event.stopPropagation();

    if (!currentUserId) {
      return;
    }

    try {
      await deleteNotification(notiCode);
      setNotifications((prev) => prev.filter((item) => item.id !== notiCode));
    } catch (err) {
      console.error("알림 삭제 실패:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId || unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      console.error("전체 알림 읽음 처리 실패:", err);
    }
  };

  const handleDeleteReadNotifications = async () => {
    if (!currentUserId || !notifications.some((item) => item.isRead)) {
      return;
    }

    try {
      await deleteReadNotifications();
      setNotifications((prev) => prev.filter((item) => !item.isRead));
    } catch (err) {
      console.error("읽은 알림 삭제 실패:", err);
    }
  };

  return (
    <>
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
      </nav>

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
              <div className="site_header_notification_head">
                <strong>알림</strong>
                <div className="site_header_notification_actions">
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    모두 읽음
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteReadNotifications}
                    disabled={!notifications.some((item) => item.isRead)}
                  >
                    읽은 알림 삭제
                  </button>
                </div>
              </div>
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
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <span className="site_header_notification_type">
                        {notif.type === "comment" ? "💬" : (notif.type === "report" || notif.type === "report_deleted") ? "⚠️" : "❤️"}
                      </span>
                      <span className="site_header_notification_content">
                        <span className="site_header_notification_text">
                          {getNotificationText(notif)}
                        </span>
                        <span className="site_header_notification_time">
                          {formatNotificationTime(notif.createdAt)}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="site_header_notification_delete"
                        onClick={(event) =>
                          handleDeleteNotification(event, notif.id)
                        }
                        aria-label="알림 삭제"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="site_header_profile">
          <button
            type="button"
            className="site_header_profile_btn"
            onClick={toggleProfile}
            aria-label="프로필 메뉴 열기"
            aria-expanded={isProfileOpen}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="프로필"
                className="site_header_profile_img"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span className="site_header_profile_fallback">
                {profileInitial}
              </span>
            )}
          </button>

          {isProfileOpen && (
            <div className="site_header_profile_dropdown">
              <button type="button" onClick={() => handleNavigate("/mypage")}>
                마이페이지
              </button>
              <button
                type="button"
                className="site_header_profile_logout"
                onClick={handleLogout}
              >
                로그아웃
              </button>
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
    </header>
    {isSuperAdmin && (
      <div className={`admin_mode_bar ${adminMode ? "is_active" : ""}`}>
        <span className="admin_mode_text">
          {adminMode ? "관리자 모드 사용 중" : "관리자 모드"}
        </span>
        <button
          type="button"
          className="admin_mode_toggle"
          onClick={toggleAdminMode}
          aria-pressed={adminMode}
        >
          <span className="admin_mode_knob" />
        </button>
      </div>
    )}
    </>
  );
}

export default Header;
