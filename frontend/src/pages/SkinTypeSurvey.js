import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import surveyData from "../data/triple_skin_type_questions_v1.json";
import "./SkinTypeSurvey.css";

const AREA_LABELS = {
  COMMON: "공통",
  FOREHEAD: "이마",
  NOSE: "코",
  CHEEK: "볼",
  CHIN: "턱",
};

function groupQuestionsBySection(questions) {
  return questions.reduce((groups, question) => {
    const title = question.section || AREA_LABELS[question.area] || "설문";
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
  const [answers, setAnswers] = useState({});

  const groupedQuestions = useMemo(
    () => groupQuestionsBySection(surveyData.questions || []),
    []
  );

  const answeredCount = Object.keys(answers).length;
  const totalCount = surveyData.questions.length;
  const progressPercent = totalCount
    ? Math.round((answeredCount / totalCount) * 100)
    : 0;

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    if (answeredCount < totalCount) {
      alert("모든 질문에 답변하면 피부 타입 진단을 완료할 수 있습니다.");
      return;
    }

    alert("설문 응답이 완료되었습니다.");
  };

  return (
    <div className="survey_app">
      <header className="survey_header">
        <button
          type="button"
          className="survey_back_button"
          onClick={() => navigate("/main")}
        >
          ← 메인으로
        </button>
        <div>
          <p className="survey_eyebrow">SKIN TYPE SURVEY</p>
          <h1>{surveyData.title}</h1>
          <p className="survey_description">{surveyData.description}</p>
        </div>
      </header>

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
          <button
            type="button"
            className="survey_submit_button"
            onClick={handleSubmit}
          >
            진단 완료하기
          </button>
        </aside>

        <section className="question_list" aria-label="피부 타입 설문 질문 목록">
          {groupedQuestions.map((group) => (
            <section className="question_section" key={group.title}>
              <div className="section_title_row">
                <h2>{group.title}</h2>
                <span>{group.questions.length}문항</span>
              </div>

              {group.questions.map((question, index) => (
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
            </section>
          ))}
        </section>
      </main>
    </div>
  );
}

export default SkinTypeSurvey;
