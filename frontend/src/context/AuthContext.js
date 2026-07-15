import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentMember,
  loginMember,
  logoutMember,
} from "../springApi/memberSpringBootApi";

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

function saveLegacyUserCache(user) {
  // 기존 userId 파라미터 기반 화면을 위한 임시 호환 값이다.
  localStorage.setItem("userId", user.userId);
  localStorage.setItem("loginUserId", user.userId);
  localStorage.setItem("loginUser", JSON.stringify(user));
}

function clearLegacyUserCache() {
  localStorage.removeItem("userId");
  localStorage.removeItem("loginUserId");
  localStorage.removeItem("loginUser");
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

    getCurrentMember()
      .then((response) => {
        if (!isMounted) return;

        setCurrentUser(response.data);
        saveLegacyUserCache(response.data);
      })
      .catch(() => {
        if (!isMounted) return;

        setCurrentUser(null);
        setAdminMode(false);
        clearLegacyUserCache();
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
    await loginMember(credentials);
    const response = await getCurrentMember();
    const user = response.data;

    setCurrentUser(user);
    saveLegacyUserCache(user);
    return user;
  };

  const logout = async () => {
    try {
      await logoutMember();
    } finally {
      clearLegacyUserCache();
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
