import { useNavigate } from "react-router-dom";

function StartPage() {
  const navigate = useNavigate();

  return (
    <div className="skin_app">
      <main className="skin_main">
        <section className="skin_intro">
          <p className="skin_label">딥러닝 기반 피부 진단</p>
          <h1>피부 진단 플랫폼</h1>
          <p className="project_explain">
            사진 기반 피부 상태 분석으로 나에게 필요한 케어 방향을 확인하세요.
          </p>
        </section>

        <div className="actions">
          <button
            className="account-button login_btn"
            type="button"
            onClick={() => navigate("/login")}
          >
            로그인하기
          </button>
          <button
            className="account-button signup_btn"
            type="button"
            onClick={() => navigate("/signup")}
          >
            회원가입
          </button>
        </div>
      </main>
    </div>
  );
}

export default StartPage;
