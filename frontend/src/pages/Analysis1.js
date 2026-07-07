import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setPredictFlask, setPredictSave, getTodayPredict } from "../flaskapi/DeepApi";
import "./Analysis1.css";

function Analysis1() {
  const [userId, setUserId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { detections, image }
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setError("");
    setResult(null);
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

    setLoading(true);
    setError("");
    setResult(null);

    try {
        // 0. 먼저 오늘 이미 예측했는지 체크 (Flask 호출 전에 막기)
        const checkResponse = await getTodayPredict(userId).catch((err) => {
        if (err.response?.status === 404) return null; // 오늘 기록 없음 = 정상 진행
        throw err;
        });

        if (checkResponse) {
        setError("오늘은 이미 예측을 완료했습니다.");
        setLoading(false);
        return; // 여기서 중단 -> Flask 호출 안 함
        }

        // 1. Flask 호출: 이미지 -> detections + 결과이미지
        const formData = new FormData();
        formData.append("image", imageFile);

        const flaskResponse = await setPredictFlask(formData);
        const { detections, image } = flaskResponse.data;

        // 2. Spring 호출: detections -> DB 저장
        await setPredictSave(userId, detections, null);

        setResult({ detections, image });
    } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 409) {
        setError(message || "오늘은 이미 예측을 완료했습니다.");
        } else {
        setError(message || "예측 처리 중 오류가 발생했습니다.");
        }
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="analysis1_app">
      <div className="analysis1_header">
        <p className="analysis1_eyebrow">AI SKIN DIAGNOSIS</p>
        <h1 className="analysis1_title">피부 진단</h1>
        <p className="analysis1_subtitle">
          사진을 업로드하면 AI가 피부 상태를 분석해드려요.
        </p>
        
      </div>

      <div className="analysis1_grid">
        {/* 업로드 카드 */}
        <div className="card">
          <h2>사진 업로드</h2>
          

          <label className="upload_dropzone">
            <input type="file" accept="image/*" onChange={handleFileChange} />
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
          </label>

          <button
            className="analysis1_submit"
            onClick={handleSubmit}
            disabled={loading || !userId}
          >
            {loading ? "분석 중..." : "분석 시작"}
          </button>

          {loading && (
            <div className="analysis1_loading" style={{ marginTop: 12 }}>
              <span className="loading_dot" />
              AI가 피부를 분석하고 있어요
            </div>
          )}

          {error && <p className="analysis1_message error">{error}</p>}
          {!userId && (
            <p className="analysis1_message info">로그인 후 이용해주세요.</p>
          )}
        </div>

        {/* 결과 카드 */}
        <div className="card">
          <h2>분석 결과</h2>

          {!result && (
            <p className="result_empty">
              아직 분석 결과가 없어요.
              <br />
              왼쪽에서 사진을 업로드하고 분석을 시작해보세요.
            </p>
          )}

          {result && (
            <>
              <img
                src={result.image}
                alt="분석 결과 이미지"
                className="result_image"
              />
              <ul className="detection_list">
                {result.detections.map((d, idx) => (
                  <li key={idx}>
                    <span className="detection_name">{d.dtype_result}</span>
                    <span className="detection_count">{d.dtype_cnt}개</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <button type="button" className="entry_add_button" onClick={() => navigate("/main")}>
        메인화면
      </button>
      </div>
      
    </div>
  );
}

export default Analysis1;