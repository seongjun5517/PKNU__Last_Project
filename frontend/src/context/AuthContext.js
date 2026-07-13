import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { springApi } from "../config/axiosInstance";

const AuthContext = createContext();
const ADMIN_MODE_STORAGE_KEY = "adminMode";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("loginUser") || "null");
  } catch (error) {
    return null;
  }
}

function getUserAuthority(user) {
  if (!user) return "";

  return String(
    user.manAuth ||
      user.man_auth ||
      user.userManAuth ||
      user.user_man_auth ||
      (user.userMan ? "SUPER_ADMIN" : "")
  ).toUpperCase();
}

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [adminMode, setAdminMode] = useState(
    localStorage.getItem(ADMIN_MODE_STORAGE_KEY) === "true"
  );

  const isSuperAdmin = useMemo(
    () => getUserAuthority(currentUser) === "SUPER_ADMIN",
    [currentUser]
  );

  useEffect(() => {
    if (!userId) {
      setCurrentUser(null);
      setAdminMode(false);
      localStorage.removeItem("loginUser");
      localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
      return;
    }

    let isMounted = true;

    springApi
      .get(`/user/${userId}`)
      .then((response) => {
        if (!isMounted) return;

        setCurrentUser(response.data);
        localStorage.setItem("loginUser", JSON.stringify(response.data));
      })
      .catch((error) => {
        console.error("로그인 사용자 정보 조회 실패:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!isSuperAdmin && adminMode) {
      setAdminMode(false);
      localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
    }
  }, [adminMode, isSuperAdmin]);

  const login = (id, user = null) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("loginUserId", id);
    if (user) {
      localStorage.setItem("loginUser", JSON.stringify(user));
      setCurrentUser(user);
    }
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("loginUserId");
    localStorage.removeItem("loginUser");
    localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
    setUserId(null);
    setCurrentUser(null);
    setAdminMode(false);
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
