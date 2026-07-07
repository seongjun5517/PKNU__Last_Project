import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestSkinTypeResult } from "../springApi/skinTypeSpringBootApi";
import "./SkinTypeResultPage.css";

function getLoginUserId() {
  return localStorage.getItem("loginUserId");
}

function getFaceResult(results, faceName) {
  return results.find((result) => result.stypeFace === faceName);
}

function SkinTypeResultPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const tZoneResult = useMemo(() => getFaceResult(results, "T존"), [results]);
  const uZoneResult = useMemo(() => getFaceResult(results, "U존"), [results]);
  const diagnosedAt = results[0]?.stypeDate
    ? new Date(results[0].stypeDate).toLocaleString("ko-KR")
    : "";

  useEffect(() => {
    const fetchLatestResult = async () => {
      const userId = getLoginUserId();

      if (!userId) {
        setMessage("로그인 후 피부 타입 진단 결과를 확인할 수 있습니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await getLatestSkinTypeResult(userId);
        setResults(response.data || []);
      } catch (error) {
        console.error("피부 타입 진단 결과 조회 실패:", error);
        setMessage("진단 결과를 불러오지 못했습니다. 서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  const renderResultBar = (label, result, colorClass) => {
    const value = result?.stypeFig || 0;

    return (
      <div className="type_result_bar">
        <div className="bar_label_row">
          <span>{label}</span>
          <strong>{result ? `${result.stypeName} ${value}%` : "결과 없음"}</strong>
        </div>
        <div className="bar_track">
          <span className={colorClass} style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="type_result_app">
      <header className="type_result_header">
        <button
          type="button"
          className="result_back_button"
          onClick={() => navigate("/main")}
        >
          ← 메인으로
        </button>
        <div>
          <p className="result_eyebrow">SKIN TYPE RESULT</p>
          <h1>피부 타입 진단 결과</h1>
          {diagnosedAt && <p className="result_date">{diagnosedAt}</p>}
        </div>
      </header>

      <main className="type_result_shell">
        {loading ? (
          <section className="result_empty_panel">결과를 불러오는 중입니다.</section>
        ) : message ? (
          <section className="result_empty_panel">
            <p>{message}</p>
            <button type="button" onClick={() => navigate("/analysis")}>
              설문하러 가기
            </button>
          </section>
        ) : results.length === 0 ? (
          <section className="result_empty_panel">
            <p>저장된 피부 타입 진단 결과가 없습니다.</p>
            <button type="button" onClick={() => navigate("/analysis")}>
              설문하러 가기
            </button>
          </section>
        ) : (
          <>
            <section className="face_result_panel">
              <div className="face_diagram" aria-label="T존과 U존 피부 타입 결과">
                <svg viewBox="0 0 240 260" role="img">
                  <path
                    className="face_outline"
                    d="M61 94C61 45 92 22 121 22C151 22 180 45 180 94C180 154 153 207 121 207C88 207 61 154 61 94Z"
                  />
                  <path
                    className="u_zone_shape"
                    d="M72 92C79 146 94 187 121 190C148 187 164 146 170 92C153 125 136 144 121 144C105 144 88 125 72 92Z"
                  />
                  <path
                    className="t_zone_shape"
                    d="M91 53C100 46 110 43 121 43C132 43 142 46 151 53C146 76 146 103 156 125C145 136 133 142 121 142C109 142 96 136 85 125C96 103 96 76 91 53Z"
                  />
                  <path
                    className="nose_line"
                    d="M121 85C113 104 111 119 121 130C131 119 129 104 121 85Z"
                  />
                  <text x="37" y="236">U존</text>
                  <text x="173" y="236">T존</text>
                </svg>
              </div>

              <div className="result_summary">
                <p className="result_caption">최신 진단</p>
                <h2>
                  {tZoneResult?.stypeName || "-"} / {uZoneResult?.stypeName || "-"}
                </h2>
                <p>
                  설문 답변 점수를 기준으로 T존과 U존의 우세 피부 타입을 계산해
                  저장했습니다.
                </p>
              </div>
            </section>

            <section className="result_bar_panel">
              {renderResultBar("T존", tZoneResult, "t_zone_fill")}
              {renderResultBar("U존", uZoneResult, "u_zone_fill")}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default SkinTypeResultPage;
