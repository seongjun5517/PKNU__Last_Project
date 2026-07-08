import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import SignUp from "../pages/SignUp";
import StartPage from "../pages/StartPage";
import MainPage from "../pages/MainPage";
import SkinTypeSurvey from "../pages/SkinTypeSurvey";
import SkinTypeResultPage from "../pages/SkinTypeResultPage";
import Analysis1 from "../pages/Analysis1";
import CommunityPage from "../pages/CommunityPage";
import CommunityWritePage from "../pages/CommunityWritePage";
import CommunityPostDetailPage from "../pages/CommunityPostDetailPage";
import Mypage from "../pages/Mypage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/write" element={<CommunityWritePage />} />
          <Route path="/community/posts/:postCode" element={<CommunityPostDetailPage />} />
          <Route path="/analysis" element={<SkinTypeSurvey />} />
          <Route path="/analysis/result" element={<SkinTypeResultPage />} />
          <Route path="/analysis1" element={<Analysis1 />} />
          <Route path="/mypage" element={<Mypage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
