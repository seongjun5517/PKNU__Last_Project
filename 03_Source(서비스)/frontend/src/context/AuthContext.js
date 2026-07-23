import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentMember,
  loginMember,
  logoutMember,
} from "../springApi/memberSpringBootApi";
import {
  ensureCsrfToken,
  refreshCsrfToken,
} from "../config/axiosInstance";

const AuthContext = createContext();
const ADMIN_MODE_STORAGE_KEY = "adminMode";

function getUserAuthority(user) {
  if (!user) return "";

  return String(
    user.role ||
      user.manAuth ||
      user.man_auth ||
      ""
  ).toUpperCase();
}

function clearLegacyIdentityCache() {
  localStorage.removeItem("userId");
  localStorage.removeItem("loginUserId");
  localStorage.removeItem("loginUser");
}

function clearAdminModeCache() {
  localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(
    localStorage.getItem(ADMIN_MODE_STORAGE_KEY) === "true"
  );

  const userId = currentUser?.userId || null;
  const isSuperAdmin = useMemo(
    () => getUserAuthority(currentUser) === "SUPER_ADMIN",
    [currentUser]
  );

  useEffect(() => {
    let isMounted = true;
    clearLegacyIdentityCache();

    // XSRF-TOKEN 쿠키가 있음
    //   → 기존 토큰 사용

    // XSRF-TOKEN 쿠키가 없음
    //   → GET /api/auth/csrf 호출
    //   → 서버가 토큰 발급
    //   → 쿠키에서 발급된 토큰 확인
    ensureCsrfToken()
      .catch((error) => {
        console.warn("CSRF 토큰 초기화 실패:", error);
      })
      .then(() => getCurrentMember())
      .then((response) => {
        if (!isMounted) return;

        setCurrentUser(response.data);
      })
      .catch(() => {
        if (!isMounted) return;

        setCurrentUser(null);
        setAdminMode(false);
        clearAdminModeCache();
      })
      .finally(() => {
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin && adminMode) {
      setAdminMode(false);
      localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
    }
  }, [adminMode, isSuperAdmin]);

  const login = async (credentials) => {
    // 로그인 성공하면 다시 토큰 발급 API 호출
    await loginMember(credentials);
    try {
      await refreshCsrfToken();
    } catch (error) {
      console.warn("로그인 후 CSRF 토큰 갱신 실패:", error);
    }
    const response = await getCurrentMember();
    const user = response.data;

    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await logoutMember();
    try {
      await refreshCsrfToken();
    } catch (error) {
      console.warn("로그아웃 후 CSRF 토큰 갱신 실패:", error);
    } finally {
      clearLegacyIdentityCache();
      clearAdminModeCache();
      setCurrentUser(null);
      setAdminMode(false);
    }
  };

  const toggleAdminMode = () => {
    if (!isSuperAdmin) {
      window.alert("SUPER_ADMIN 권한이 있는 관리자만 사용할 수 있습니다.");
      return;
    }

    setAdminMode((prev) => {
      const next = !prev;
      if (next) {
        window.alert("관리자 모드로 변경합니다.");
        localStorage.setItem(ADMIN_MODE_STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        currentUser,
        authLoading,
        isSuperAdmin,
        adminMode: isSuperAdmin && adminMode,
        login,
        logout,
        toggleAdminMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
