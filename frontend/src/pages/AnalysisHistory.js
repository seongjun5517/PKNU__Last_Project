import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDeepHistory } from "../springApi/deepSpringBootApi";
import { getSkinTypeHistory } from "../springApi/skinTypeSpringBootApi";
import { useAuth } from "../context/AuthContext";
import "./AnalysisHistory.css";

const CLASS_META = {
  ato: { label: "아토피", color: "#e07a8b" },
  bi: { label: "비립종", color: "#7aa0e0" },
  acne: { label: "여드름", color: "#e0b57a" },
};

/* ---------------- 일별 추이 라인차트 (아토피 / 비립종 / 여드름 공용) ---------------- */
function DailyLineChart({ classKey, dailyRecords }) {
  const meta = CLASS_META[classKey];

  // dailyRecords: [{ date, detections: [{ dtype_result, dtype_cnt }, ...] }, ...]
  const chartData = useMemo(() => {
    return dailyRecords.map((day) => {
      const count = day.detections
        .filter((d) => d.dtype_result === classKey)
        .reduce((sum, d) => sum + Number(d.dtype_cnt || 0), 0);
      return { label: day.date.slice(5, 10), count };
    });
  }, [dailyRecords, classKey]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const { count } = payload[0].payload;
    return (
      <div className="chart_tooltip_box">
        <div className="chart_tooltip_date">{label}</div>
        <div>{count}개 탐지</div>
      </div>
    );
  };

  if (chartData.length === 0 || chartData.every((d) => d.count === 0)) {
    return <p className="analysis_empty">아직 {meta.label} 관련 분석 기록이 없어요.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis
          domain={[0, (dataMax) => Math.max(1, Math.ceil(dataMax))]}
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}개`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          name={`${meta.label} 탐지 개수`}
          stroke={meta.color}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------------- 피부타입(건성/지성/민감성) 막대그래프 ---------------- */
const TYPE_COLOR = { 건성: "#7aa0e0", 지성: "#e0b57a", 민감성: "#e07a8b" };

function SkinTypeBarChart({ skinTypeRecords }) {
  // skinTypeRecords: 최근 10일치 전체 행 [{ stypeDate, stypeFace, stypeName, stypeFig }, ...]
  const chartData = useMemo(() => {
    const bucket = {
      건성: { sum: 0, count: 0 },
      지성: { sum: 0, count: 0 },
      민감성: { sum: 0, count: 0 },
    };

    skinTypeRecords.forEach((row) => {
      if (row.stypeFace === "최종") return; // T존/U존/민감도만 집계
      if (bucket[row.stypeName]) {
        bucket[row.stypeName].sum += row.stypeFig;
        bucket[row.stypeName].count += 1;
      }
    });

    return Object.entries(bucket).map(([name, { sum, count }]) => ({
      name,
      percent: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      count,
    }));
  }, [skinTypeRecords]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, percent, count } = payload[0].payload;
    return (
      <div className="chart_tooltip_box">
        <div className="chart_tooltip_date">{name}</div>
        <div>평균 {percent}% · {count}회</div>
      </div>
    );
  };

  if (chartData.every((d) => d.count === 0)) {
    return <p className="analysis_empty">아직 피부 타입 분석 기록이 없어요.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={TYPE_COLOR[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- 분석기록 전체 ---------------- */
export default function AnalysisHistory() {
  const { userId, authLoading } = useAuth();
  const [deepHistory, setDeepHistory] = useState([]);
  const [skinTypeHistory, setSkinTypeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setLoading(false);
      return;
    }

    Promise.all([
      getDeepHistory().catch((err) => {
        console.error("아토피/비립종/여드름 기록 조회 실패:", err);
        return { data: [] };
      }),
      getSkinTypeHistory().catch((err) => {
        console.error("피부타입 기록 조회 실패:", err);
        return { data: [] };
      }),
    ])
      .then(([deepRes, skinRes]) => {
        setDeepHistory(deepRes.data || []);

        // 날짜 기준 최근 10일치만 남기기
        const allDates = [
          ...new Set((skinRes.data || []).map((r) => r.stypeDate.slice(0, 10))),
        ]
          .sort()
          .slice(-10);
        const recentSkin = (skinRes.data || []).filter((r) =>
          allDates.includes(r.stypeDate.slice(0, 10))
        );
        setSkinTypeHistory(recentSkin);
      })
      .finally(() => setLoading(false));
  }, [authLoading, userId]);

  if (!userId) {
    return <p className="analysis_empty">로그인 후 분석 기록을 확인할 수 있어요.</p>;
  }
  if (loading) {
    return <p className="posts_loading">불러오는 중...</p>;
  }

  return (
    <div className="analysis_history_grid">
      <div className="card">
        <div className="analysis_chart_heading">
          <h3>아토피 추이</h3>
          <span className="analysis_chart_unit count">단위: 개</span>
        </div>
        <DailyLineChart classKey="ato" dailyRecords={deepHistory} />
      </div>
      <div className="card">
        <div className="analysis_chart_heading">
          <h3>비립종 추이</h3>
          <span className="analysis_chart_unit count">단위: 개</span>
        </div>
        <DailyLineChart classKey="bi" dailyRecords={deepHistory} />
      </div>
      <div className="card">
        <div className="analysis_chart_heading">
          <h3>여드름 추이</h3>
          <span className="analysis_chart_unit count">단위: 개</span>
        </div>
        <DailyLineChart classKey="acne" dailyRecords={deepHistory} />
      </div>
      <div className="card">
        <div className="analysis_chart_heading">
          <h3>피부 타입 분포</h3>
          <span className="analysis_chart_unit percent">단위: %</span>
        </div>
        <SkinTypeBarChart skinTypeRecords={skinTypeHistory} />
      </div>
    </div>
  );
}
