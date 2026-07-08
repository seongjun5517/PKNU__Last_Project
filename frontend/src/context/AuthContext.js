import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 초기값을 localStorage에서 가져옵니다.
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  // 로그인/로그아웃 시 상태를 갱신하는 함수
  const login = (id) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("loginUserId", id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("loginUserId");
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
