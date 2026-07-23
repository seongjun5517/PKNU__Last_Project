import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { getFeedbackList } from "../springApi/feedbackSpringBootApi";
import "./FeedbackListPage.css";

const TYPE_LABEL = {
  SKIN_TYPE: "피부 타입 분석",
  SKIN_STATUS: "피부 상태 분석",
};

const EVALUATION_LABEL = {
  HELPFUL: "도움됐어요",
  DISAPPOINTED: "아쉬워요",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecentDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      key: getDateKey(date),
      label: `${date.getMonth() + 1}/${date.getDate()}`,
    };
  });
}

function FeedbackListPage() {
  const navigate = useNavigate();
  const { userId, adminMode } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const dashboard = useMemo(() => {
    const total = feedbackList.length;
    const helpfulCount = feedbackList.filter((item) => item.fbEvaluate === "HELPFUL").length;
    const commentCount = feedbackList.filter((item) => Boolean(item.fbComment?.trim())).length;
    const typeStats = Object.keys(TYPE_LABEL).map((type) => {
      const items = feedbackList.filter((item) => item.fbType === type);
      const helpful = items.filter((item) => item.fbEvaluate === "HELPFUL").length;

      return {
        type: TYPE_LABEL[type],
        helpful,
        disappointed: items.length - helpful,
        helpfulRate: items.length ? Math.round((helpful / items.length) * 100) : 0,
      };
    });
    const trend = getRecentDays().map((day) => {
      const items = feedbackList.filter((item) => getDateKey(item.fbCreatedAt) === day.key);
      return {
        date: day.label,
        "피드백 수": items.length,
        "도움됐어요": items.filter((item) => item.fbEvaluate === "HELPFUL").length,
      };
    });

    return {
      total,
      helpfulRate: total ? Math.round((helpfulCount / total) * 100) : 0,
      commentRate: total ? Math.round((commentCount / total) * 100) : 0,
      typeStats,
      trend,
      disappointed: feedbackList.filter((item) => item.fbEvaluate === "DISAPPOINTED"),
    };
  }, [feedbackList]);

  useEffect(() => {
    if (!adminMode || !userId) {
      setLoading(false);
      return;
    }

    const loadFeedback = async () => {
      try {
        setLoading(true);
        const response = await getFeedbackList();
        setFeedbackList(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("피드백 목록 조회 실패:", error);
        setErrorMessage(error.response?.data?.message || "피드백 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [adminMode, userId]);

  if (!adminMode) {
    return (
      <main className="feedback_list_page feedback_list_restricted">
        <h1>관리자 모드가 필요합니다.</h1>
        <p>메인 화면에서 관리자 모드를 켠 뒤 피드백 목록을 확인해 주세요.</p>
        <button type="button" onClick={() => navigate("/main")}>메인으로 돌아가기</button>
      </main>
    );
  }

  return (
    <main className="feedback_list_page">
      <header className="feedback_list_header">
        <div>
          <p>ADMIN · AI ANALYSIS</p>
          <h1>사용자 피드백</h1>
          <span>피부 타입·상태 분석 서비스에 제출된 의견을 확인합니다.</span>
        </div>
        <button type="button" onClick={() => navigate("/main")}>메인으로</button>
      </header>

      {loading ? (
        <section className="feedback_list_empty">피드백을 불러오는 중입니다.</section>
      ) : errorMessage ? (
        <section className="feedback_list_empty is_error">{errorMessage}</section>
      ) : feedbackList.length === 0 ? (
        <section className="feedback_list_empty">아직 제출된 피드백이 없습니다.</section>
      ) : (
        <>
          <section className="feedback_kpi_grid" aria-label="피드백 핵심 지표">
            <article>
              <span>전체 피드백</span>
              <strong>{dashboard.total}</strong>
              <small>건</small>
            </article>
            <article>
              <span>도움됐어요 비율</span>
              <strong>{dashboard.helpfulRate}</strong>
              <small>%</small>
            </article>
            <article>
              <span>코멘트 작성률</span>
              <strong>{dashboard.commentRate}</strong>
              <small>%</small>
            </article>
          </section>

          <section className="feedback_chart_grid" aria-label="피드백 통계 차트">
            <article className="feedback_chart_card">
              <div className="feedback_section_heading">
                <div>
                  <p>BY ANALYSIS TYPE</p>
                  <h2>분석 유형별 만족도</h2>
                </div>
                <span>건수</span>
              </div>
              <div className="feedback_chart" role="img" aria-label="피부 타입과 피부 상태 분석별 도움됐어요 및 아쉬워요 건수">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard.typeStats} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="type" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="helpful" name="도움됐어요" fill="#7c9b82" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="disappointed" name="아쉬워요" fill="#bd6f63" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="feedback_chart_card">
              <div className="feedback_section_heading">
                <div>
                  <p>LAST 7 DAYS</p>
                  <h2>최근 7일 피드백 추이</h2>
                </div>
                <span>일별</span>
              </div>
              <div className="feedback_chart" role="img" aria-label="최근 7일 동안 제출된 피드백 수와 도움됐어요 수 추이">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard.trend} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="피드백 수" stroke="#7a5570" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="도움됐어요" stroke="#7c9b82" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          {dashboard.disappointed.length > 0 && (
            <section className="feedback_priority_section">
              <div className="feedback_section_heading">
                <div>
                  <p>PRIORITY REVIEW</p>
                  <h2>개선이 필요한 의견</h2>
                </div>
                <span>아쉬워요 {dashboard.disappointed.length}건</span>
              </div>
              <div className="feedback_cards feedback_cards_priority">
                {dashboard.disappointed.map((feedback) => (
                  <FeedbackCard key={feedback.fbCode} feedback={feedback} />
                ))}
              </div>
            </section>
          )}

          <section className="feedback_all_section">
            <div className="feedback_section_heading">
              <div>
                <p>ALL RESPONSES</p>
                <h2>전체 피드백 목록</h2>
              </div>
              <span>최신순</span>
            </div>
            <div className="feedback_cards" aria-label="제출된 피드백 목록">
              {feedbackList.map((feedback) => (
                <FeedbackCard key={feedback.fbCode} feedback={feedback} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function FeedbackCard({ feedback }) {
  return (
    <article className="feedback_list_card">
      <div className="feedback_card_topline">
        <span className="feedback_type_badge">{TYPE_LABEL[feedback.fbType] || feedback.fbType}</span>
        <span className={`feedback_evaluation_badge ${feedback.fbEvaluate === "HELPFUL" ? "is_helpful" : "is_disappointed"}`}>
          {EVALUATION_LABEL[feedback.fbEvaluate] || feedback.fbEvaluate}
        </span>
      </div>
      <p className={`feedback_comment ${feedback.fbComment ? "" : "is_empty"}`}>
        {feedback.fbComment || "작성된 코멘트가 없습니다."}
      </p>
      <footer>
        <span>{feedback.userNickname || feedback.fbUserId} <em>({feedback.fbUserId})</em></span>
        <time>{formatDate(feedback.fbCreatedAt)}</time>
      </footer>
    </article>
  );
}

export default FeedbackListPage;
