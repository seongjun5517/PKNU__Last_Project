import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

// Header를 숨길 경로 목록 (로그인, 회원가입, 시작화면 등 로그인 전 화면)
const NO_HEADER_PATHS = ["/", "/login", "/signup", "/start"];

function Layout({ children }) {
  const location = useLocation();
  const showHeader = !NO_HEADER_PATHS.includes(location.pathname);

  return (
    <div className="app_layout">
      {showHeader && <Header />}
      <div className="app_content">{children}</div>
      <Footer />
    </div>
  );
}

export default Layout;