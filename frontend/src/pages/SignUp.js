import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SignUp.css";

function SignUp() {
  const [form, setForm] = useState({
    user_id: "",
    user_email: "",
    user_pwd: "",
    confirm_pwd: "",
    user_nickname: "",
    user_birthday: "",
    user_profile_image: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");

  // 프로필 이미지 미리보기 URL 만들기
  useEffect(() => {
    if (!form.user_profile_image) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(form.user_profile_image);
    setPreviewUrl(nextPreviewUrl);
    
    // revokeObjectURL : 브라우저가 임시로 만들어 둔 파일/이미지 URL 해제 함수
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [form.user_profile_image]);

  // 입력값을 form 상태에 저장
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    let nextValue = value;

    if (files) {
      nextValue = files[0] || null;
    }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: nextValue,
    }));
  };

  // 회원가입 버튼 클릭 시 입력값 확인
  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.user_id.trim() ||
      !form.user_email.trim() ||
      !form.user_pwd.trim() ||
      !form.user_nickname.trim()
    ) {
      setMessage("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (form.user_pwd !== form.confirm_pwd) {
      setMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    // 서버로 보낼 회원가입 데이터 만드릭
    const signupFormData = new FormData();
    signupFormData.append("user_id", form.user_id.trim());
    signupFormData.append("user_email", form.user_email.trim());
    signupFormData.append("user_pwd", form.user_pwd);
    signupFormData.append("user_nickname", form.user_nickname.trim());
    signupFormData.append("user_birthday", form.user_birthday);

    if (form.user_profile_image) {
      signupFormData.append("user_profile_image", form.user_profile_image);
    }

    console.log("signup form", Object.fromEntries(signupFormData.entries()));
    setMessage("회원가입 클릭!!!!.");
  };

  // 이미지 미리보기
  const renderProfilePreview = () => {
    if (previewUrl) {
      return <img src={previewUrl} alt="프로필 미리보기" />;
    }

    return <span>사진</span>;
  };

  return (
    <div className="signup_page">
      <main className="signup_shell">
        <section className="signup_panel signup_intro_panel">
          <p className="signup_eyebrow">Create Account</p>
          <h1>나만의 피부 관리 기록을 만들어보세요.</h1>
          <p>
            사용자 ERD에 맞춰 아이디, 이메일, 비밀번호, 닉네임, 생년월일,
            프로필 이미지를 입력받습니다.
          </p>
        </section>

        <section className="signup_panel signup_form_panel">
          <div className="signup_header">
            <p className="signup_caption">회원가입</p>
            <h2>새 계정 만들기</h2>
          </div>

          <form className="signup_form" onSubmit={handleSubmit}>
            <div className="signup_grid">
              <label className="signup_field">
                <span>아이디</span>
                <input
                  type="text"
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  placeholder="사용자 아이디"
                  autoComplete="username"
                />
              </label>

              <label className="signup_field">
                <span>닉네임</span>
                <input
                  type="text"
                  name="user_nickname"
                  value={form.user_nickname}
                  onChange={handleChange}
                  placeholder="사용자 닉네임"
                  autoComplete="nickname"
                />
              </label>
            </div>

            <label className="signup_field">
              <span>이메일</span>
              <input
                type="email"
                name="user_email"
                value={form.user_email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>

            <div className="signup_grid">
              <label className="signup_field">
                <span>비밀번호</span>
                <input
                  type="password"
                  name="user_pwd"
                  value={form.user_pwd}
                  onChange={handleChange}
                  placeholder="비밀번호"
                  autoComplete="new-password"
                />
              </label>

              <label className="signup_field">
                <span>비밀번호 확인</span>
                <input
                  type="password"
                  name="confirm_pwd"
                  value={form.confirm_pwd}
                  onChange={handleChange}
                  placeholder="비밀번호 재입력"
                  autoComplete="new-password"
                />
              </label>
            </div>

            <label className="signup_field">
              <span>생년월일</span>
              <input
                type="date"
                name="user_birthday"
                value={form.user_birthday}
                onChange={handleChange}
              />
            </label>

            <label className="signup_profile_upload">
              <span className="signup_profile_preview">
                {renderProfilePreview()}
              </span>
              <span className="signup_profile_upload_text">
                <strong>프로필 사진</strong>
                <small>JPG, PNG 이미지를 선택하세요.</small>
              </span>
              <input
                type="file"
                name="user_profile_image"
                accept="image/*"
                onChange={handleChange}
              />
            </label>

            {message && <p className="signup_message">{message}</p>}

            <button className="signup_primary_button" type="submit">
              회원가입
            </button>
          </form>

          <p className="signup_switch">
            이미 계정이 있나요? <Link to="/login">로그인</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default SignUp;
