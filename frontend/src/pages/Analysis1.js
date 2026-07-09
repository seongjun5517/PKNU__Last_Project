import { useState, useEffect } from "react";
import {
  deleteLatestPredict,
  getLatestPredict,
  setPredictFlask,
  setPredictSave,
} from "../flaskapi/DeepApi";
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
    ingredients: [
      { name: "티트리", desc: "트러블 부위 진정에 도움" },
      { name: "살리실산(BHA)", desc: "피지와 각질 관리에 도움" },
      { name: "판테놀", desc: "자극받은 피부 보습과 장벽 케어" },
    ],
  },
  bi: {
    label: "비립종",
    color: "var(--gold)",
    products: [
      { name: "저자극 각질 케어 토너", desc: "거친 피부결을 부드럽게 정돈" },
      { name: "가벼운 수분 젤 크림", desc: "답답함 없이 수분 공급" },
    ],
    ingredients: [
      { name: "PHA", desc: "민감 피부도 부담이 적은 각질 케어" },
      { name: "글루코노락톤", desc: "피부결 정돈과 보습 보조" },
      { name: "알란토인", desc: "자극 완화와 진정 케어" },
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
    ingredients: [
      { name: "세라마이드", desc: "약해진 피부 장벽 보강" },
      { name: "시어버터", desc: "건조한 피부의 보습막 형성" },
      { name: "마데카소사이드", desc: "민감 피부 진정 케어" },
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
    ingredients: [
      { name: "히알루론산", desc: "가벼운 수분 충전" },
      { name: "글리세린", desc: "기본 보습 유지" },
      { name: "녹차 추출물", desc: "산뜻한 진정 케어" },
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
    ingredients: [
      { name: "히알루론산", desc: "수분 공급" },
      { name: "세라마이드", desc: "피부 장벽 케어" },
    ],
  },
};

const DIAGNOSIS_COMMENTS = {
  acne: "피부에 여드름성 트러블이 감지되었어요. 자극을 최소화하고 진정 케어를 우선해주세요.",
  bi: "피부에 비립종으로 보이는 작은 돌기가 감지되었어요. 무리하게 압출하지 말고 부드러운 각질 관리가 필요해요.",
  ato: "피부에 건조함과 민감 반응이 감지되었어요. 보습을 충분히 해주고 자극적인 제품 사용은 피해 주세요.",
  "acne+bi":
    "여드름성 트러블과 비립종이 함께 감지되었어요. 피부 자극을 줄이고 유분 조절과 부드러운 각질 관리를 함께 진행해주세요.",
  "bi+ato":
    "비립종과 민감·건조 반응이 함께 감지되었어요. 강한 각질 제거는 피하고 보습과 장벽 케어를 우선해주세요.",
  "acne+ato":
    "여드름성 트러블과 민감 반응이 함께 감지되었어요. 자극적인 여드름 케어보다는 진정과 보습 중심의 관리가 필요해요.",
  "acne+bi+ato":
    "여드름, 비립종, 민감·건조 반응이 함께 감지되었어요. 피부 장벽이 약해질 수 있으니 진정, 보습, 저자극 관리를 우선해주세요.",
};

const DIAGNOSIS_TYPE_ORDER = ["acne", "bi", "ato"];

const MASCOT_INFO = {
  acne: {
    label: "아크니",
    image: "/img/mascot-acne.png",
  },
  bi: {
    label: "비리",
    image: "/img/mascot-bi.png",
  },
  ato: {
    label: "아토",
    image: "/img/mascot-ato.png",
  },
};

function getSkinInfo(detections) {
  if (!detections || detections.length === 0) return SKIN_TYPE_INFO.default;
  const top = [...detections].sort((a, b) => b.dtype_cnt - a.dtype_cnt)[0];
  return SKIN_TYPE_INFO[top.dtype_result] || SKIN_TYPE_INFO.default;
}

function getDetectionInfo(type) {
  return SKIN_TYPE_INFO[type] || SKIN_TYPE_INFO.default;
}

function getDiagnosisComment(detections) {
  const detectedTypes = new Set(
    normalizeDetections(detections)
      .filter((item) => (item.dtype_cnt || 0) > 0)
      .map((item) => item.dtype_result)
  );

  const key = DIAGNOSIS_TYPE_ORDER.filter((type) => detectedTypes.has(type)).join("+");

  if (DIAGNOSIS_COMMENTS[key]) {
    return DIAGNOSIS_COMMENTS[key];
  }

  return getSkinInfo(detections).comment;
}

function getDetectedMascots(detections) {
  const detectionByType = new Map(
    normalizeDetections(detections)
      .filter((item) => (item.dtype_cnt || 0) > 0)
      .map((item) => [item.dtype_result, item])
  );

  return DIAGNOSIS_TYPE_ORDER
    .filter((type) => detectionByType.has(type))
    .map((type) => ({
      type,
      count: detectionByType.get(type)?.dtype_cnt || 0,
      detection: detectionByType.get(type),
      ...MASCOT_INFO[type],
      ...getDetectionInfo(type),
    }));
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
  const [checkingSavedResult, setCheckingSavedResult] = useState(true);
  const [deletingLatest, setDeletingLatest] = useState(false);

  // 저장된 최신 분석이 있으면 바로 결과 화면 표시
  useEffect(() => {
    if (!userId) {
      setCheckingSavedResult(false);
      return;
    }

    (async () => {
      try {
        const res = await getLatestPredict(userId);
        if (res?.data) {
          setResult({
            detections: normalizeDetections(res.data.detections),
            image: `${FLASK_BASE_URL}${res.data.imgPath}`,
          });
          setView("result");
        }
      } catch (err) {
        // 404 등 -> 저장된 기록 없음, 업로드 화면 유지
      } finally {
        setCheckingSavedResult(false);
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
          ? message || "이미 저장된 피부 상태 분석 결과가 있습니다."
          : message || "예측 처리 중 오류가 발생했습니다."
      );
      setView("upload");
    }
  };

  const handleRetest = async () => {
    if (!userId) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!window.confirm("저장된 최신 피부 상태 분석 결과와 진단 사진을 삭제하고 다시 진단할까요?")) {
      return;
    }

    try {
      setDeletingLatest(true);
      setError("");
      await deleteLatestPredict(userId);
      setImageFile(null);
      setPreviewUrl(null);
      setResult(null);
      setView("upload");
    } catch (err) {
      console.error("최신 피부 상태 분석 결과 삭제 실패:", err);
      alert("재진단 준비에 실패했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setDeletingLatest(false);
    }
  };

  const skinInfo = result ? getSkinInfo(result.detections) : null;
  const diagnosisComment = result ? getDiagnosisComment(result.detections) : "";
  const detectedMascots = result ? getDetectedMascots(result.detections) : [];
  

  return (
    <div className="analysis1_app">
      <div className="analysis1_header">
        <div>
          <p className="analysis1_eyebrow">AI SKIN DIAGNOSIS</p>
          <h1 className="analysis1_title">피부 진단</h1>
        </div>
        {view === "result" && result && (
          <button
            type="button"
            className="analysis1_retest_button"
            onClick={handleRetest}
            disabled={deletingLatest}
          >
            {deletingLatest ? "삭제 중" : "재진단하기"}
          </button>
        )}
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
              <span className="today_badge">최신 분석 완료</span>
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
              disabled={!userId || checkingSavedResult}
            >
              분석 시작
            </button>
          )}

          {error && <p className="analysis1_message error">{error}</p>}
          {!userId && (
            <p className="analysis1_message info">로그인 후 이용해주세요.</p>
          )}
        </div>

        {/* 오른쪽 박스: 감지 목록 + 코멘트 */}
        <div className="card analysis1_result_card">
          <h2>분석 결과</h2>

          {view === "result" && result && skinInfo ? (
            <div className="analysis1_result_detail">
              {detectedMascots.length > 0 && (
                <div
                  className={`analysis1_mascot_list count_${detectedMascots.length}`}
                  aria-label="감지된 피부 상태 마스코트"
                >
                  {detectedMascots.map((mascot) => (
                    <figure
                      key={mascot.type}
                      className="analysis1_mascot"
                      style={{ "--detection-color": mascot.color }}
                    >
                      <figcaption className="analysis1_mascot_result">
                        <span className="detection_name">{mascot.label}</span>
                        <span className="detection_code">{mascot.type}</span>
                        <span className="detection_count">{mascot.count}개</span>
                      </figcaption>
                      <img src={mascot.image} alt={`${mascot.label} 마스코트`} />
                    </figure>
                  ))}
                </div>
              )}

              <div className="analysis1_comment" style={{ "--comment-accent": skinInfo.color }}>
                <h3>TripleSkin의 코멘트</h3>
                <p>{diagnosisComment}</p>
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

      {view === "result" && result && skinInfo && (
        <section className="analysis1_recommend_section">
          <div className="analysis1_recommend_card">
            <p className="analysis1_recommend_eyebrow">COSMETIC PICK</p>
            <h3>화장품 추천</h3>
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

          <div className="analysis1_recommend_card">
            <p className="analysis1_recommend_eyebrow">INGREDIENT PICK</p>
            <h3>성분 추천</h3>
            <ul className="recommend_list">
              {skinInfo.ingredients.map((item, idx) => (
                <li key={idx}>
                  <span className="recommend_dot ingredient_dot" />
                  <div className="recommend_text">
                    <span className="recommend_name">{item.name}</span>
                    <span className="recommend_desc">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default Analysis1;
