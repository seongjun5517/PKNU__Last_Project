import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getFeedbackSubmissionStatus,
  submitFeedback,
} from "../springApi/feedbackSpringBootApi";
import "./AnalysisFeedback.css";

function AnalysisFeedback({ feedbackType, analysisName }) {
  const { userId } = useAuth();
  const [evaluation, setEvaluation] = useState("");
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSubmission = async () => {
      if (!userId) {
        if (isMounted) {
          setHasSubmitted(false);
          setIsCheckingSubmission(false);
        }
        return;
      }

      try {
        const response = await getFeedbackSubmissionStatus(userId, feedbackType);
        if (isMounted) {
          setHasSubmitted(response.data?.submitted === true);
        }
      } catch (error) {
        console.error("피드백 제출 여부 조회 실패:", error);
      } finally {
        if (isMounted) {
          setIsCheckingSubmission(false);
        }
      }
    };

    setIsCheckingSubmission(true);
    checkSubmission();

    return () => {
      isMounted = false;
    };
  }, [feedbackType, userId]);

  const openFeedback = (nextEvaluation) => {
    if (!userId) {
      window.alert("피드백을 남기려면 로그인해 주세요.");
      return;
    }

    if (hasSubmitted) {
      window.alert("이미 제출한 피드백입니다. 재진단 후 다시 작성할 수 있습니다.");
      return;
    }

    setEvaluation(nextEvaluation);
    setIsOpen(true);
  };

  const closeFeedback = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setComment("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!evaluation || !userId) return;

    try {
      setIsSubmitting(true);
      await submitFeedback({
        userId,
        feedbackType,
        evaluation,
        comment: comment.trim() || null,
      });
      setHasSubmitted(true);
      window.alert("피드백이 제출되었습니다. 더 나은 AI 분석 서비스를 만드는 데 활용할게요.");
      setIsOpen(false);
      setComment("");
    } catch (error) {
      console.error("피드백 제출 실패:", error);
      const message = error.response?.data?.message;
      if (error.response?.status === 409) {
        setHasSubmitted(true);
        setIsOpen(false);
      }
      window.alert(message || "피드백 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="analysis_feedback" aria-label={`${analysisName} 피드백`}>
      <div>
        <p className="analysis_feedback_eyebrow">FEEDBACK</p>
        <h3>이번 AI 분석, 도움이 되었나요?</h3>
        <p>짧은 평가와 의견이 분석 서비스를 개선하는 데 큰 도움이 됩니다.</p>
      </div>
      {isCheckingSubmission ? (
        <p className="analysis_feedback_status">피드백 제출 여부를 확인하고 있어요.</p>
      ) : hasSubmitted ? (
        <p className="analysis_feedback_status is_submitted">이미 제출한 피드백입니다.</p>
      ) : (
        <div className="analysis_feedback_actions">
          <button type="button" className="is_helpful" onClick={() => openFeedback("HELPFUL")}>
            도움이 됐어요
          </button>
          <button type="button" className="is_disappointed" onClick={() => openFeedback("DISAPPOINTED")}>
            아쉬워요
          </button>
        </div>
      )}

      {isOpen && (
        <div className="feedback_modal_backdrop" role="presentation" onMouseDown={closeFeedback}>
          <form
            className="feedback_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <button
              type="button"
              className="feedback_modal_close"
              onClick={closeFeedback}
              aria-label="피드백 창 닫기"
              disabled={isSubmitting}
            >
              ×
            </button>
            <p className="analysis_feedback_eyebrow">{analysisName.toUpperCase()} FEEDBACK</p>
            <h2 id="feedback-modal-title">
              {evaluation === "HELPFUL" ? "도움이 되었다니 기뻐요!" : "더 나아질 수 있도록 들려주세요."}
            </h2>
            <p className="feedback_modal_description">
              코멘트는 선택 사항이에요. 작성하지 않아도 평가만 제출할 수 있습니다.
            </p>
            <label htmlFor={`feedback-comment-${feedbackType}`}>의견 남기기 (선택)</label>
            <textarea
              id={`feedback-comment-${feedbackType}`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              placeholder="분석 결과에서 좋았던 점이나 아쉬운 점을 알려주세요."
            />
            <div className="feedback_modal_footer">
              <span>{comment.length}/1000</span>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "제출 중..." : "제출하기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AnalysisFeedback;
