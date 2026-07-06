import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginMember } from "../springApi/memberSpringBootApi";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_id: "",
    user_pwd: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.user_id.trim() || !form.user_pwd.trim()) {
      setMessage("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const loginPayload = {
      user_id: form.user_id.trim(),
      user_pwd: form.user_pwd,
    };

    try {
      await loginMember(loginPayload);
      localStorage.setItem("loginUserId", loginPayload.user_id);
      navigate("/main");
    } catch (error) {
      setMessage(error.response?.data || "서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="login_page">
      <main className="login_shell">
        <section className="login_panel login_intro_panel">
          <p className="login_eyebrow">Skin Predict Platform</p>
          <h1>피부 분석을 시작해볼까요?</h1>
          <p>
            계정으로 로그인하면 피부 이미지 분석 결과와 케어 기록을 이어서
            확인할 수 있습니다.
          </p>
          <Link className="login_start_link" to="/start">
            처음 화면으로
          </Link>
        </section>

        <section className="login_panel login_form_panel">
          <div className="login_header">
            <p className="login_caption">로그인</p>
            <h2>계정 로그인</h2>
          </div>

          <form className="login_form" onSubmit={handleSubmit}>
            <label className="login_field">
              <span>아이디</span>
              <input
                type="text"
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
              />
            </label>

            <label className="login_field">
              <span>비밀번호</span>
              <input
                type="password"
                name="user_pwd"
                value={form.user_pwd}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
            </label>

            {message && <p className="login_message">{message}</p>}

            <button className="login_primary_button" type="submit">
              로그인
            </button>
          </form>

          <p className="login_switch">
            아직 계정이 없나요? <Link to="/signup">회원가입</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
