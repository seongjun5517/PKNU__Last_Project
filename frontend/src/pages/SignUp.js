import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  insertMember,
  uploadMemberProfileImage,
} from "../springApi/memberSpringBootApi";
import { useAuth } from "../context/AuthContext";
import "./SignUp.css";
import {
  isImageFileTooLarge,
  MAX_IMAGE_FILE_SIZE_LABEL,
} from "../config/uploadLimits";

function SignUp() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

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

  useEffect(() => {
    if (!form.user_profile_image) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(form.user_profile_image);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [form.user_profile_image]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    const nextValue = files ? files[0] || null : value;

    if (files && isImageFileTooLarge(nextValue)) {
      setForm((prevForm) => ({ ...prevForm, [name]: null }));
      setMessage(`프로필 이미지는 ${MAX_IMAGE_FILE_SIZE_LABEL} 이하만 선택할 수 있습니다.`);
      event.target.value = "";
      return;
    }

    setMessage("");
    setForm((prevForm) => ({
      ...prevForm,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
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

    const signupPayload = {
      user_id: form.user_id.trim(),
      user_email: form.user_email.trim(),
      user_pwd: form.user_pwd,
      user_nickname: form.user_nickname.trim(),
      user_birthday: form.user_birthday || null,
      user_profile_image: null,
    };

    try {
      await insertMember(signupPayload);
    } catch (error) {
      setMessage(
        error.response?.status === 413
          ? `프로필 이미지는 ${MAX_IMAGE_FILE_SIZE_LABEL} 이하만 업로드할 수 있습니다.`
          : error.response?.data || "서버와 연결할 수 없습니다."
      );
      return;
    }

    let profileUploadFailed = false;
    let temporarySessionCreated = false;

    if (form.user_profile_image) {
      try {
        await login({
          user_id: signupPayload.user_id,
          user_pwd: signupPayload.user_pwd,
        });
        temporarySessionCreated = true;
        await uploadMemberProfileImage(form.user_profile_image);
      } catch (error) {
        profileUploadFailed = true;
        console.error("회원가입 후 프로필 이미지 업로드 실패:", error);
      } finally {
        if (temporarySessionCreated) {
          await logout().catch((error) =>
            console.warn("회원가입 임시 세션 정리 실패:", error)
          );
        }
      }
    }

    if (profileUploadFailed) {
      window.alert(
        "회원가입은 완료됐지만 프로필 이미지는 저장하지 못했습니다. 로그인 후 마이페이지에서 다시 등록해주세요."
      );
    }

    setMessage("회원가입이 완료되었습니다.");
    navigate("/login");
  };

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
            계정을 만들면 피부 분석 결과와 케어 기록을 계속 관리할 수 있습니다.
          </p>
          <Link className="signup_start_link" to="/start">
            처음 화면으로
          </Link>
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
                  placeholder="사용할 아이디"
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
                  placeholder="사용할 닉네임"
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
                <small>JPG, PNG 이미지를 선택하세요</small>
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
