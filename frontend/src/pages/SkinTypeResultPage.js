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
                  <svg viewBox="0 0 240 280" role="img">
                    {/* 얼굴 윤곽 */}
                    <path
                      className="face_outline"
                      d="M120 25 C82 25 58 62 58 108 C58 150 68 190 88 220 C100 238 110 250 120 250 C130 250 140 238 152 220 C172 190 182 150 182 108 C182 62 158 25 120 25 Z"
                    />
                    {/* 귀 */}
                    <path
                      className="ear_shape"
                      d="M58 105 C48 106 46 122 49 133 C52 141 58 139 60 129 Z"
                    />
                    <path
                      className="ear_shape"
                      d="M182 105 C192 106 194 122 191 133 C188 141 182 139 180 129 Z"
                    />

                    {/* U존: 볼~턱선 */}
                    <path
                      className="u_zone_shape"
                      d="M70 128 C71 163 81 199 99 221 C108 232 132 232 141 221 C159 199 169 163 170 128 C166 144 154 158 140 151 C130 146 124 144 120 144 C116 144 110 146 100 151 C86 158 74 144 70 128 Z"
                    />

                    {/* T존: 이마 가로 밴드 */}
                    <path
                      className="t_zone_shape"
                      d="M78 96 C77 71 95 51 120 49 C145 51 163 71 162 96 C162 101 149 103 120 103 C91 103 78 101 78 96 Z"
                    />
                    {/* T존: 콧대(세로) */}
                    <path
                      className="t_zone_shape"
                      d="M109 96 L131 96 L127 174 C123 179 117 179 113 174 Z"
                    />

                    {/* 눈썹 */}
                    <path className="face_feature_line" d="M90 108 C97 102 108 102 115 107" />
                    <path className="face_feature_line" d="M125 107 C132 102 143 102 150 108" />

                    {/* 눈 */}
                    <ellipse className="eye_shape" cx="100" cy="121" rx="10" ry="5" />
                    <ellipse className="eye_shape" cx="140" cy="121" rx="10" ry="5" />
                    <circle className="pupil_shape" cx="100" cy="121" r="2.4" />
                    <circle className="pupil_shape" cx="140" cy="121" r="2.4" />

                    {/* 입술 */}
                    <path
                      className="lip_shape"
                      d="M100 187 C110 182 130 182 140 187 C130 197 110 197 100 187 Z"
                    />
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
                <div className="zone_result_list">
                  {renderZoneRow("T존", tZoneResult, "t_chip", "t_zone_fill")}
                  {renderZoneRow("U존", uZoneResult, "u_chip", "u_zone_fill")}
                </div>
                <p>
                  설문 답변 점수를 기준으로 T존과 U존의 우세 피부 타입을 계산해
                  저장했습니다.
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