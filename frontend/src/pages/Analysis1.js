import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setPredictFlask, setPredictSave, getTodayPredict } from "../flaskapi/DeepApi";
import "./Analysis1.css";
import { useAuth } from "../context/AuthContext";

// 진단 타입별 코멘트 & 추천 화장품 매핑
// 실제 dtype_result 값: bi, acne, ato, normal
const SKIN_TYPE_INFO = {
  acne: {
    label: "여드름성 트러블",
    color: "var(--rose)",
    comment:
      "피부에 여드름성 트러블이 감지되었어요. 자극을 최소화하고 진정 케어를 우선해주세요.",
    products: [
      { name: "저자극 진정 토너", desc: "약산성으로 트러블 부위를 자극 없이 진정" },
      { name: "티트리 스팟 세럼", desc: "트러블 부위 집중 케어" },
      { name: "논코메도제닉 수분크림", desc: "모공 막힘 없이 수분 공급" },
    ],
  },
  bi: {
    label: "색소침착",
    color: "var(--gold)",
    comment: "색소침착이 관찰돼요. 미백 성분으로 톤 개선 케어를 추천해요.",
    products: [
      { name: "비타민C 브라이트닝 세럼", desc: "칙칙한 피부톤 개선" },
      { name: "나이아신아마이드 앰플", desc: "색소침착 완화 및 피부결 개선" },
    ],
  },
  ato: {
    label: "아토피성 피부",
    color: "var(--sage)",
    comment:
      "아토피성 건조·자극 반응이 감지되었어요. 저자극 보습 중심의 케어가 필요해요.",
    products: [
      { name: "세라마이드 고보습 크림", desc: "피부 장벽 강화 및 자극 완화" },
      { name: "무향 저자극 로션", desc: "민감해진 피부 진정" },
    ],
  },
  normal: {
    label: "양호",
    color: "var(--sage-dark)",
    comment: "전반적으로 양호한 피부 상태예요. 꾸준한 보습과 자외선 차단이 중요해요.",
    products: [
      { name: "수분 진정 크림", desc: "피부 장벽 강화" },
      { name: "선크림 SPF50+", desc: "자외선 차단으로 피부 손상 예방" },
    ],
  },
  default: {
    label: "결과",
    color: "var(--ink-faint)",
    comment: "전반적으로 양호한 피부 상태예요. 꾸준한 보습과 자외선 차단이 중요해요.",
    products: [
      { name: "수분 진정 크림", desc: "피부 장벽 강화" },
      { name: "선크림 SPF50+", desc: "자외선 차단으로 피부 손상 예방" },
    ],
  },
};

function getSkinInfo(detections) {
  if (!detections || detections.length === 0) return SKIN_TYPE_INFO.default;
  const top = [...detections].sort((a, b) => b.dtype_cnt - a.dtype_cnt)[0];
  return SKIN_TYPE_INFO[top.dtype_result] || SKIN_TYPE_INFO.default;
}

// Flask 서버 주소 (배포 시 실제 서버 주소로 변경)
const FLASK_BASE_URL = "http://localhost:5000";

// detections가 undefined/null로 와도 항상 배열을 반환
function normalizeDetections(detections) {
  return Array.isArray(detections) ? detections : [];
}

function Analysis1() {
  const { userId } = useAuth();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { detections, image }
  const [view, setView] = useState("upload"); // 'upload' | 'loading' | 'result'
  const [checkingToday, setCheckingToday] = useState(true);
  const navigate = useNavigate();

  // 오늘 이미 분석했는지 마운트 시 확인 -> 있으면 바로 결과 화면 표시
  useEffect(() => {
    if (!userId) {
      setCheckingToday(false);
      return;
    }

    (async () => {
      try {
        const res = await getTodayPredict(userId);
        if (res?.data) {
          setResult({
            detections: normalizeDetections(res.data.detections),
            image: `${FLASK_BASE_URL}${res.data.imgPath}`,
          });
          setView("result");
        }
      } catch (err) {
        // 404 등 -> 오늘 기록 없음, 업로드 화면 유지
      } finally {
        setCheckingToday(false);
      }
    })();
  }, [userId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!imageFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setError("");
    setView("loading");

    // 최소 2초간 로딩 화면을 보여주기 위한 지연
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const checkResponse = await getTodayPredict(userId).catch((err) => {
        if (err.response?.status === 404) return null; // 오늘 기록 없음 = 정상 진행
        throw err;
      });

      if (checkResponse) {
        await minDelay;
        setError("오늘은 이미 예측을 완료했습니다.");
        setView("upload");
        return;
      }

      const formData = new FormData();
      formData.append("image", imageFile);

      const [flaskResponse] = await Promise.all([setPredictFlask(formData), minDelay]);
      const { detections, image, imgPath } = flaskResponse.data;

      await setPredictSave(userId, detections, imgPath);

      // 분석 직후에는 base64 image를 바로 사용 (추가 요청 없이 즉시 렌더링)
      setResult({ detections: normalizeDetections(detections), image });
      setView("result");
    } catch (err) {
      await minDelay;
      const status = err.response?.status;
      const message = err.response?.data?.message;

      setError(
        status === 409
          ? message || "오늘은 이미 예측을 완료했습니다."
          : message || "예측 처리 중 오류가 발생했습니다."
      );
      setView("upload");
    }
  };

  const skinInfo = result ? getSkinInfo(result.detections) : null;
  

  return (
    <div className="analysis1_app">
      <div className="analysis1_header">
        <div>
          <p className="analysis1_eyebrow">AI SKIN DIAGNOSIS</p>
          <h1 className="analysis1_title">피부 진단</h1>
        </div>
        <button type="button" className="mypage_link" onClick={() => navigate("/main")}>
          메인으로
        </button>
      </div>

      <p className="analysis1_subtitle">
        사진을 업로드하면 AI가 피부 상태를 분석해드려요.
      </p>

      <div className="analysis1_grid">
        {/* 왼쪽 박스: 이미지 (업로드 -> 로딩 -> 결과 전환) */}
        <div className="card analysis1_image_card">
          <div className="card_header_row">
            <h2>사진</h2>
            {view === "result" && result && (
              <span className="today_badge">오늘 분석 완료</span>
            )}
          </div>

          <div className="analysis1_image_stage">
            {(view === "upload" || view === "loading") && (
              <label className="upload_dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={view === "loading"}
                />
                {previewUrl ? (
                  <div className="upload_preview">
                    <img src={previewUrl} alt="업로드 미리보기" />
                  </div>
                ) : (
                  <p className="upload_hint">
                    클릭하여 사진을 선택해주세요
                    <br />
                    (JPG, PNG)
                  </p>
                )}

                {view === "loading" && (
                  <div className="analysis1_loading_overlay">
                    <div className="loading_dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>AI가 피부를 분석하고 있어요</p>
                  </div>
                )}
              </label>
            )}

            {view === "result" && result && (
              <div className="upload_preview result_fade_in">
                <img src={result.image} alt="분석 결과 이미지" />
              </div>
            )}
          </div>

          {view === "upload" && (
            <button
              className="analysis1_submit"
              onClick={handleSubmit}
              disabled={!userId || checkingToday}
            >
              분석 시작
            </button>
          )}

          {error && <p className="analysis1_message error">{error}</p>}
          {!userId && (
            <p className="analysis1_message info">로그인 후 이용해주세요.</p>
          )}
        </div>

        {/* 오른쪽 박스: 감지 목록 + 코멘트 + 추천 화장품 */}
        <div className="card analysis1_result_card">
          <h2>분석 결과</h2>

          {view === "result" && result && skinInfo ? (
            <div className="analysis1_result_detail">
              <ul className="detection_list">
                {(result.detections || []).map((d, idx) => (
                  <li key={idx}>
                    <span className="detection_name">{d.dtype_result}</span>
                    <span className="detection_count">{d.dtype_cnt}개</span>
                  </li>
                ))}
              </ul>

              <div className="analysis1_comment" style={{ "--comment-accent": skinInfo.color }}>
                <h3>진단 코멘트</h3>
                <p>{skinInfo.comment}</p>
              </div>

              <div className="analysis1_recommend">
                <h3>추천 화장품</h3>
                <ul className="recommend_list">
                  {skinInfo.products.map((p, idx) => (
                    <li key={idx}>
                      <span className="recommend_dot" />
                      <div className="recommend_text">
                        <span className="recommend_name">{p.name}</span>
                        <span className="recommend_desc">{p.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="analysis1_result_placeholder">
              <p className="result_empty">
                아직 분석 결과가 없어요.
                <br />
                왼쪽에서 사진을 업로드하고 분석을 시작해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analysis1;