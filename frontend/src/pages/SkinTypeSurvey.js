import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import surveyData from "../data/triple_skin_type_questions_v1.json";
import {
  getLatestSkinTypeResult,
  saveSkinTypeResult,
} from "../springApi/skinTypeSpringBootApi";
import "./SkinTypeSurvey.css";

const AREA_LABELS = {
  COMMON: "공통",
  FOREHEAD: "이마",
  NOSE: "코",
  CHEEK: "볼",
  CHIN: "턱",
};

// SCORE_KEYS: JSON scores 객체에 들어있는 피부 타입 점수 키 목록
const SCORE_KEYS = ["dry", "oily", "normal", "sensitive"];

// ZONE_LABELS: DB에 저장할 T존/U존 한글 부위명
const ZONE_LABELS = {
  T_ZONE: "T존",
  U_ZONE: "U존",
  SENSITIVE: "민감도",
};

// createEmptyScores: 각 피부 타입 점수를 0으로 초기화한 객체 생성
function createEmptyScores() {
  return SCORE_KEYS.reduce((scores, key) => ({ ...scores, [key]: 0 }), {});
}

// getLoginUserId: localStorage에 저장된 로그인 사용자 아이디 조회
function getLoginUserId() {
  return localStorage.getItem("loginUserId");
}

// addScores: 선택한 답변의 점수를 T존/U존 누적 점수에 더함
function addScores(targetScores, optionScores = {}) {
  SCORE_KEYS.forEach((key) => {
    targetScores[key] += optionScores[key] || 0;
  });
}

function getScorePercent(scores, scoreKey) {
  const totalScore = SCORE_KEYS.reduce((sum, key) => sum + scores[key], 0);
  return totalScore ? Math.round((scores[scoreKey] / totalScore) * 100) : 0;
}

// getDominantType: 누적 점수 중 가장 높은 피부 타입과 퍼센트 계산
function getDominantType(scores) {
  const dominantKey = SCORE_KEYS.reduce((bestKey, key) =>
    scores[key] > scores[bestKey] ? key : bestKey
  );

  return {
    typeKey: dominantKey,
    stypeName: surveyData.scoreTypes[dominantKey] || dominantKey,
    stypeFig: getScorePercent(scores, dominantKey),
  };
}

function getBaseSkinType(tZoneRatios, uZoneRatios, tZoneType, uZoneType) {
  if (
    tZoneRatios.oily >= 60 &&
    (uZoneRatios.dry >= 40 || uZoneRatios.normal >= 40)
  ) {
    return "복합성 피부";
  }

  if (tZoneRatios.oily >= 60 && uZoneRatios.oily >= 50) {
    return "지성 피부";
  }

  if (tZoneRatios.dry >= 50 && uZoneRatios.dry >= 50) {
    return "건성 피부";
  }

  if (tZoneRatios.normal >= 50 && uZoneRatios.normal >= 50) {
    return "중성 피부";
  }

  if (
    tZoneType === "oily" &&
    (uZoneType === "dry" || uZoneType === "normal")
  ) {
    return "복합성 피부";
  }

  if (tZoneType === uZoneType) {
    return `${surveyData.scoreTypes[tZoneType]} 피부`;
  }

  return "복합성 피부";
}

function addSensitivePrefix(baseType, sensitivePercent) {
  if (sensitivePercent < 50) return baseType;
  return baseType.startsWith("민감성") ? baseType : `민감성 ${baseType}`;
}

// calculateSkinTypeResults: 설문 답변을 DB 저장용 T존/U존/민감도/최종 결과 배열로 변환
function calculateSkinTypeResults(answers) {
  const zoneScores = {
    T_ZONE: createEmptyScores(),
    U_ZONE: createEmptyScores(),
    SENSITIVE: createEmptyScores(),
  };

  surveyData.questions.forEach((question) => {
    if (!zoneScores[question.zone]) return;

    const selectedOptionId = answers[question.questionId];
    const selectedOption = question.options.find(
      (option) => option.optionId === selectedOptionId
    );

    if (selectedOption) {
      addScores(zoneScores[question.zone], selectedOption.scores);
    }
  });

  const tZoneResult = getDominantType(zoneScores.T_ZONE);
  const uZoneResult = getDominantType(zoneScores.U_ZONE);
  const sensitivePercent = getScorePercent(zoneScores.SENSITIVE, "sensitive");
  const tZoneRatios = SCORE_KEYS.reduce(
    (ratios, key) => ({ ...ratios, [key]: getScorePercent(zoneScores.T_ZONE, key) }),
    {}
  );
  const uZoneRatios = SCORE_KEYS.reduce(
    (ratios, key) => ({ ...ratios, [key]: getScorePercent(zoneScores.U_ZONE, key) }),
    {}
  );
  const baseType = getBaseSkinType(
    tZoneRatios,
    uZoneRatios,
    tZoneResult.typeKey,
    uZoneResult.typeKey
  );
  const finalType = addSensitivePrefix(baseType, sensitivePercent);

  return [
    {
      stypeFace: ZONE_LABELS.T_ZONE,
      stypeName: tZoneResult.stypeName,
      stypeFig: tZoneResult.stypeFig,
    },
    {
      stypeFace: ZONE_LABELS.U_ZONE,
      stypeName: uZoneResult.stypeName,
      stypeFig: uZoneResult.stypeFig,
    },
    {
      stypeFace: ZONE_LABELS.SENSITIVE,
      stypeName: sensitivePercent >= 50 ? "민감성" : "일반",
      stypeFig: sensitivePercent,
    },
    {
      stypeFace: "최종",
      stypeName: finalType,
      stypeFig: sensitivePercent,
    },
  ];
}

// questions 배열을 section 값 기준으로 묶어 페이지 단위로 사용할 구조 만들기ㅣ
function groupQuestionsBySection(questions) {
  return questions.reduce((groups, question) => {
    // title: 현재 질문이 속한 섹션 이름입니다. section 값이 없으면 area 값을 한글로 바꿔 사용
    const title = question.section || AREA_LABELS[question.area] || "설문";
    // current: 이미 만들어진 같은 섹션 그룹입니다.
    const current = groups.find((group) => group.title === title);

    if (current) {
      current.questions.push(question);
      return groups;
    }

    return [...groups, { title, questions: [question] }];
  }, []);
}

function SkinTypeSurvey() {
  const navigate = useNavigate();

  // answers: 사용자가 선택한 답변 저장 객체 예) { Q001: "A2", Q002: "A4" }
  const [answers, setAnswers] = useState({});
  const [checkingSavedResult, setCheckingSavedResult] = useState(true);

  // currentSectionIndex: 현재 화면에 보여줄 질문 섹션의 순번. 0이면 첫 번째 섹션
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // groupedQuestions: JSON 질문 목록을 공통/이마/코/볼/턱/민감성 질문처럼 섹션별로 묶은 배열
  const groupedQuestions = useMemo(
    () => groupQuestionsBySection(surveyData.questions || []),
    []
  );

  useEffect(() => {
    const checkSavedResult = async () => {
      if (sessionStorage.getItem("skipSkinTypeSavedResultCheck") === "true") {
        sessionStorage.removeItem("skipSkinTypeSavedResultCheck");
        setCheckingSavedResult(false);
        return;
      }

      const userId = getLoginUserId();

      if (!userId) {
        setCheckingSavedResult(false);
        return;
      }

      try {
        const response = await getLatestSkinTypeResult(userId);
        if ((response.data || []).length > 0) {
          navigate("/analysis/result");
          return;
        }
      } catch (error) {
        console.error("저장된 피부 타입 진단 결과 확인 실패:", error);
      } finally {
        setCheckingSavedResult(false);
      }
    };

    checkSavedResult();
  }, [navigate]);

  // currentGroup: 현재 페이지에서 보여줄 섹션 그룹
  const currentGroup = groupedQuestions[currentSectionIndex];

  // answeredCount: 전체 질문 중 답변을 선택한 문항 수
  const answeredCount = Object.keys(answers).length;

  // totalCount: JSON에 들어있는 전체 질문 개수
  const totalCount = surveyData.questions.length;

  // progressPercent: 전체 설문 진행률입니다. 진행률 바의 width 값으로 사용
  const progressPercent = totalCount
    ? Math.round((answeredCount / totalCount) * 100)
    : 0;

  // currentSectionAnsweredCount: 현재 섹션 안에서 답변을 선택한 문항 수
  const currentSectionAnsweredCount =
    currentGroup?.questions.filter((question) => answers[question.questionId])
      .length || 0;

  // isFirstSection: 현재 섹션이 첫 번째인지 확인해서 이전 버튼 비활성화에 사용
  const isFirstSection = currentSectionIndex === 0;

  // isLastSection: 현재 섹션이 마지막인지 확인해서 다음 버튼 대신 완료 버튼을 보여줄 때 사용
  const isLastSection = currentSectionIndex === groupedQuestions.length - 1;

  // moveToSection: 이전/다음 버튼이나 왼쪽 섹션 목록을 눌렀을 때 해당 섹션으로 이동
  const moveToSection = (nextIndex) => {
    setCurrentSectionIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // handleSelect: 선택한 답변을 answers 객체에 questionId 기준으로 저장
  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // handleSubmit: 모든 문항 답변 여부를 확인한 뒤 설문 결과를 DB에 저장
  const handleSubmit = async () => {
    if (answeredCount < totalCount) {
      alert("모든 질문에 답변하면 피부 타입 진단을 완료할 수 있습니다.");
      return;
    }

    const userId = getLoginUserId();
    if (!userId) {
      alert("로그인 후 피부 타입 진단 결과를 저장할 수 있습니다.");
      navigate("/login");
      return;
    }

    const results = calculateSkinTypeResults(answers);

    try {
      await saveSkinTypeResult({ userId, results });
      navigate("/analysis/result");
    } catch (error) {
      console.error("피부 타입 진단 결과 저장 실패:", error);
      const status = error.response?.status;
      const serverMessage = error.response?.data;
      const detail = status
        ? `상태코드: ${status}\n${serverMessage || ""}`
        : "백엔드 서버에 연결할 수 없습니다.";
      alert(`진단 결과 저장에 실패했습니다.\n${detail}`);
    }
  };

  return (
    <div className="survey_app">
      <header className="survey_header">
        <div>
          <p className="survey_eyebrow">SKIN TYPE SURVEY</p>
          <h1>{surveyData.title}</h1>
          <p className="survey_description">{surveyData.description}</p>
        </div>
      </header>

      {checkingSavedResult ? (
        <main className="survey_check_panel">
          저장된 피부 타입 진단 결과를 확인하는 중입니다.
        </main>
      ) : (
      <main className="survey_layout">
        <aside className="survey_summary">
          <p className="summary_label">진행률</p>
          <strong>
            {answeredCount}/{totalCount}
          </strong>
          <div className="progress_track" aria-label={`진행률 ${progressPercent}%`}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="summary_hint">
            현재 상태와 가장 가까운 답변을 선택해주세요.
          </p>

          <ol className="section_step_list" aria-label="설문 섹션 목록">
            {groupedQuestions.map((group, index) => {
              // answeredInGroup: 왼쪽 섹션 목록에서 각 섹션의 완료 여부를 판단하기 위한 답변 수
              const answeredInGroup = group.questions.filter(
                (question) => answers[question.questionId]
              ).length;

              // isActive: 왼쪽 섹션 목록에서 현재 보고 있는 섹션인지 표시
              const isActive = index === currentSectionIndex;

              // isDone: 해당 섹션의 모든 질문에 답변했는지 표시
              const isDone = answeredInGroup === group.questions.length;

              return (
                <li key={group.title}>
                  <button
                    type="button"
                    className={`${isActive ? "active" : ""}${
                      isDone ? " done" : ""
                    }`}
                    onClick={() => moveToSection(index)}
                  >
                    <span>{index + 1}</span>
                    <em>{group.title}</em>
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            className="survey_submit_button"
            onClick={handleSubmit}
          >
            진단 완료하기
          </button>
        </aside>

        <section className="question_list" aria-label="피부 타입 설문 질문 목록">
          {currentGroup && (
            <section className="question_section">
              <div className="section_title_row">
                <div>
                  <p className="section_page_label">
                    {currentSectionIndex + 1}/{groupedQuestions.length}
                  </p>
                  <h2>{currentGroup.title}</h2>
                </div>
                <span>
                  {currentSectionAnsweredCount}/{currentGroup.questions.length}문항
                </span>
              </div>

              {currentGroup.questions.map((question, index) => (
                <article className="question_card" key={question.questionId}>
                  <div className="question_top">
                    <span className="question_number">
                      {question.questionId}
                    </span>
                    <span className="question_area">
                      {AREA_LABELS[question.area] || question.area}
                    </span>
                  </div>
                  <h3>
                    {index + 1}. {question.questionText}
                  </h3>

                  <div className="option_grid">
                    {question.options.map((option) => {
                      // isSelected: 현재 보기 버튼이 사용자가 선택한 답변인지 확인
                      const isSelected =
                        answers[question.questionId] === option.optionId;

                      return (
                        <button
                          type="button"
                          className={`option_button${
                            isSelected ? " selected" : ""
                          }`}
                          key={option.optionId}
                          onClick={() =>
                            handleSelect(question.questionId, option.optionId)
                          }
                        >
                          <span className="option_mark" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}

              <div className="survey_pagination">
                <button
                  type="button"
                  className="page_button secondary"
                  onClick={() => moveToSection(currentSectionIndex - 1)}
                  disabled={isFirstSection}
                >
                  이전
                </button>

                {isLastSection ? (
                  <button
                    type="button"
                    className="page_button primary"
                    onClick={handleSubmit}
                  >
                    진단 완료하기
                  </button>
                ) : (
                  <button
                    type="button"
                    className="page_button primary"
                    onClick={() => moveToSection(currentSectionIndex + 1)}
                  >
                    다음
                  </button>
                )}
              </div>
            </section>
          )}
        </section>
      </main>
      )}
    </div>
  );
}

export default SkinTypeSurvey;
