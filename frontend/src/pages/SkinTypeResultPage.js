import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteTodaySkinTypeResult,
  getTodaySkinTypeResult,
} from "../springApi/skinTypeSpringBootApi";
import "./SkinTypeResultPage.css";

function getLoginUserId() {
  return localStorage.getItem("loginUserId");
}

function getFaceResult(results, faceName) {
  return results.find((result) => result.stypeFace === faceName);
}

function getFallbackFinalType(tZoneResult, uZoneResult) {
  if (!tZoneResult || !uZoneResult) return "피부 타입 분석 결과";

  if (
    tZoneResult.stypeName === "지성" &&
    (uZoneResult.stypeName === "건성" || uZoneResult.stypeName === "중성")
  ) {
    return "복합성 피부";
  }

  if (tZoneResult.stypeName === uZoneResult.stypeName) {
    return `${tZoneResult.stypeName} 피부`;
  }

  return "복합성 피부";
}

function SkinTypeResultPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  const tZoneResult = useMemo(() => getFaceResult(results, "T존"), [results]);
  const uZoneResult = useMemo(() => getFaceResult(results, "U존"), [results]);
  const sensitiveResult = useMemo(() => getFaceResult(results, "민감도"), [results]);
  const finalResult = useMemo(() => getFaceResult(results, "최종"), [results]);
  const finalTypeName =
    finalResult?.stypeName || getFallbackFinalType(tZoneResult, uZoneResult);
  const diagnosedAt = results[0]?.stypeDate
    ? new Date(results[0].stypeDate).toLocaleString("ko-KR")
    : "";

  useEffect(() => {
    const fetchTodayResult = async () => {
      const userId = getLoginUserId();

      if (!userId) {
        setMessage("로그인 후 피부 타입 진단 결과를 확인할 수 있습니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await getTodaySkinTypeResult(userId);
        setResults(response.data || []);
      } catch (error) {
        console.error("피부 타입 진단 결과 조회 실패:", error);
        setMessage("오늘 진단 결과를 불러오지 못했습니다. 서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayResult();
  }, []);

  const handleRetest = async () => {
    const userId = getLoginUserId();

    if (!userId) {
      navigate("/login");
      return;
    }

    if (!window.confirm("오늘 저장된 피부 타입 진단 결과를 삭제하고 다시 진단할까요?")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteTodaySkinTypeResult(userId);
      navigate("/analysis");
    } catch (error) {
      console.error("오늘 피부 타입 진단 결과 삭제 실패:", error);
      alert("재진단 준비에 실패했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setDeleting(false);
    }
  };

  const renderZoneRow = (zoneLabel, result, chipClass, fillClass) => {
    const value = result?.stypeFig || 0;

    return (
      <div className="zone_result_row">
        <div className="zone_result_text">
          <strong>
            {result ? `${result.stypeName} ${result.stypeFig}%` : "결과 없음"}
          </strong>
          <span className={`zone_chip ${chipClass}`}>{zoneLabel}</span>
        </div>
        <div className="zone_inline_bar">
          <span className="bar_track">
            <span className={fillClass} style={{ width: `${value}%` }} />
          </span>
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
        <button
          type="button"
          className="result_retest_button"
          onClick={handleRetest}
          disabled={deleting || loading || results.length === 0}
        >
          {deleting ? "삭제 중" : "재진단하기"}
        </button>
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
              <div className="face_diagram_wrap">
                <div className="face_diagram" aria-label="T존과 U존 피부 타입 결과">
                  <svg viewBox="0 0 240 300" role="img">
                    {/* 얼굴 윤곽 */}
                    <path
                      className="face_outline"
                      d="M120 30 C85 30 62 58 58 98 C55 130 62 162 78 190 C92 214 104 232 120 236 C136 232 148 214 162 190 C178 162 185 130 182 98 C178 58 155 30 120 30 Z"
                    />

                    {/* U존: 턱선을 따라가는 라인 */}
                    <path
                      className="u_zone_shape"
                      d="M82 140 C84 168 92 194 105 212 C111 220 129 220 135 212 C148 194 156 168 158 140"
                    />

                    {/* T존: 이마 가로 밴드 */}
                    <path
                      className="t_zone_shape"
                      d="M84 92 C82 68 99 52 120 50 C141 52 158 68 156 92 C156 98 143 100 120 100 C97 100 84 98 84 92 Z"
                    />
                    {/* T존: 콧대~인중 */}
                    <path
                      className="t_zone_shape"
                      d="M112 98 L128 98 L124 168 C120 172 120 172 116 168 Z"
                    />

                    {/* 눈썹 */}
                    <path className="face_feature_line" d="M95 108 C102 103 111 103 117 107" />
                    <path className="face_feature_line" d="M123 107 C129 103 138 103 145 108" />

                    {/* 눈 (점 형태) */}
                    <circle className="pupil_shape" cx="101" cy="121" r="3.2" />
                    <circle className="pupil_shape" cx="139" cy="121" r="3.2" />

                    {/* 입 (라인형) */}
                    <path className="face_feature_line" d="M105 178 C113 184 127 184 135 178" />
                  </svg>
                </div>
                <div className="face_legend">
                  <div className="legend_item">
                    <span className="legend_dot t_dot" />
                    <span>T존 (이마·코)</span>
                  </div>
                  <div className="legend_item">
                    <span className="legend_dot u_dot" />
                    <span>U존 (볼·턱)</span>
                  </div>
                </div>
              </div>

              <div className="result_summary">
                <p className="result_caption">오늘의 진단</p>
                <div className="final_result_block">
                  <span>당신의 피부 타입은 ~~ ?</span>
                  <h2>{finalTypeName}</h2>
                  {sensitiveResult && (
                    <p>
                      민감도 {sensitiveResult.stypeFig}% ·{" "}
                      {sensitiveResult.stypeName}
                    </p>
                  )}
                </div>
                <div className="zone_result_list">
                  {renderZoneRow("T존", tZoneResult, "t_chip", "t_zone_fill")}
                  {renderZoneRow("U존", uZoneResult, "u_chip", "u_zone_fill")}
                  {sensitiveResult &&
                    renderZoneRow(
                      "민감도",
                      sensitiveResult,
                      "sensitive_chip",
                      "sensitive_fill"
                    )}
                </div>
                <p>
                  T존과 U존의 건성·지성·중성 흐름을 먼저 보고, 민감도 점수가
                  기준 이상이면 최종 타입 앞에 민감성을 함께 표시합니다.
                </p>
              </div>
            </section>

            <section className="recommend_section">
              <div className="recommend_card">
                <p className="recommend_eyebrow">COSMETIC PICK</p>
                <h3>화장품 추천</h3>
                <p className="recommend_placeholder">
                  진단된 피부 타입에 맞는 추천 화장품이 이곳에 표시될 예정입니다.
                </p>
              </div>
              <div className="recommend_card">
                <p className="recommend_eyebrow">INGREDIENT PICK</p>
                <h3>성분 추천</h3>
                <p className="recommend_placeholder">
                  피부 타입별로 추천되는 성분 정보가 이곳에 표시될 예정입니다.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default SkinTypeResultPage;
