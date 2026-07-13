import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteLatestSkinTypeResult,
  getLatestSkinTypeResult,
} from "../springApi/skinTypeSpringBootApi";
import "./SkinTypeResultPage.css";
import AnalysisFeedback from "../components/AnalysisFeedback";

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

const SKIN_TYPE_INGREDIENTS = {
  건성: [
    { name: "세라마이드", desc: "건조해진 피부 장벽 보강에 도움" },
    { name: "히알루론산", desc: "피부 속 수분 유지에 도움" },
    { name: "스쿠알란", desc: "수분 증발을 줄이는 보습막 형성에 도움" },
  ],
  지성: [
    { name: "나이아신아마이드", desc: "과다 피지와 번들거림 관리에 도움" },
    { name: "살리실산(BHA)", desc: "피지와 묵은 각질 관리에 도움" },
    { name: "징크 PCA", desc: "산뜻한 피부 컨디션 관리에 도움" },
  ],
  민감성: [
    { name: "판테놀", desc: "자극받은 피부의 보습과 진정에 도움" },
    { name: "마데카소사이드", desc: "민감해진 피부 진정에 도움" },
    { name: "알란토인", desc: "피부 자극 완화에 도움" },
  ],
  복합성: [
    { name: "글리세린", desc: "부위별 수분 균형 유지에 도움" },
    { name: "베타글루칸", desc: "가볍게 수분을 보충하고 진정하는 데 도움" },
    { name: "에크토인", desc: "건조하고 예민한 부위의 보호에 도움" },
  ],
  기본: [
    { name: "히알루론산", desc: "기본 수분 관리에 도움" },
    { name: "글리세린", desc: "피부 보습 유지에 도움" },
    { name: "판테놀", desc: "피부 컨디션 진정에 도움" },
  ],
};

const SKIN_TYPE_ORDER = ["건성", "지성", "민감성", "복합성"];

function getSkinTypeIngredientRecommendations(finalTypeName) {
  const types = SKIN_TYPE_ORDER.filter((type) => finalTypeName.includes(type));
  const recommendationTypes = types.length > 0 ? types : ["기본"];

  return recommendationTypes.map((type) => ({
    label: type === "기본" ? "기본 피부 관리" : `${type} 피부`,
    items: SKIN_TYPE_INGREDIENTS[type],
  }));
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
  const ingredientRecommendations = getSkinTypeIngredientRecommendations(finalTypeName);
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
        setMessage("저장된 진단 결과를 불러오지 못했습니다. 서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  const handleRetest = async () => {
    const userId = getLoginUserId();

    if (!userId) {
      navigate("/login");
      return;
    }

    if (!window.confirm("저장된 최신 피부 타입 진단 결과를 삭제하고 다시 진단할까요?")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteLatestSkinTypeResult(userId);
      sessionStorage.setItem("skipSkinTypeSavedResultCheck", "true");
      navigate("/analysis");
    } catch (error) {
      console.error("최신 피부 타입 진단 결과 삭제 실패:", error);
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
                  <img
                    className="face_diagram_image"
                    src="/img/skin-type-face-map.png"
                    alt="T존과 U존 피부 타입 영역"
                  />
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
                <p className="result_caption">최신 진단</p>
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
                <p className="recommend_eyebrow">INGREDIENT PICK</p>
                <h3>성분 추천</h3>
                {ingredientRecommendations.map((recommendation) => (
                  <div className="ingredient_recommendation_group" key={recommendation.label}>
                    <h4>{recommendation.label}</h4>
                    <ul className="ingredient_recommendation_list">
                      {recommendation.items.map((item) => (
                        <li key={item.name}>
                          <span className="ingredient_recommendation_dot" />
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            <AnalysisFeedback
              feedbackType="SKIN_TYPE"
              analysisName="피부 타입 분석"
            />
          </>
        )}
      </main>
    </div>
  );
}

export default SkinTypeResultPage;
