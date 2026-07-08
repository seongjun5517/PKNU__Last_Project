import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

import { toDateKey, sortByTime } from "../utils/dateUtils";
import {
  getCalList,
  setCalInsert,
  setCalUpdate, // (calCode, data)
  setCaldel,    // (calCode)
} from "../springApi/CalendarSpringBootApi";
import { useAuth } from "../context/AuthContext";

import CalendarCard from "../components/main/CalendarCard";
import EntryPanel from "../components/main/EntryPanel";
import CommunityList from "../components/main/CommunityList";
import TodoList from "../components/main/TodoList";
import UpcomingList from "../components/main/UpcomingList";
import AnalysisButtons from "../components/main/AnalysisButtons";

function MainPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const [entries, setEntries] = useState({});

  const [categories] = useState([
    { id: "pack", name: "팩", color: "#BD6F63" },
    { id: "procedure", name: "시술", color: "#7C9B82" },
  ]);

  const getCategory = useCallback(
    (id) =>
      categories.find((category) => category.id === id) || {
        name: "",
        color: "#A79FB0",
      },
    [categories]
  );

  useEffect(() => {
    const fetchEntries = async () => {
      if (!userId) {
        console.warn("로그인 정보가 없습니다. 캘린더를 불러올 수 없습니다.");
        setEntries({});
        return;
      }

      try {
        const response = await getCalList(userId);
        const calendarList = Array.isArray(response.data) ? response.data : [];

        const fetchedData = calendarList.reduce((acc, item) => {
          const rawDate = String(item.calTaskDate || "");
          const dateKey = rawDate.substring(0, 10);
          const timeOnly =
            rawDate.length >= 16 ? rawDate.substring(11, 16) : item.calTime || "";

          if (!dateKey) return acc;
          if (!acc[dateKey]) acc[dateKey] = [];

          acc[dateKey].push({
            id: item.calCode,
            title: item.calTitle,
            time: timeOnly,
            categoryId: item.calCategory,
            done: item.calIsCompleted === 1,
          });

          return acc;
        }, {});

        setEntries(fetchedData);
      } catch (error) {
        console.error("캘린더 데이터 로딩 실패:", error);
      }
    };

    fetchEntries();
  }, [userId]);

  const streakCount = useMemo(() => {
    let count = 0;
    const cursor = new Date(today);

    while (true) {
      const key = toDateKey(cursor);
      if ((entries[key] || []).length > 0) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return count;
  }, [entries, today]);

  const upcomingEntries = useMemo(() => {
    const todayStart = new Date(`${todayKey}T00:00:00`);
    const list = [];

    Object.entries(entries).forEach(([dateKey, dayList]) => {
      const date = new Date(`${dateKey}T00:00:00`);
      if (date >= todayStart) {
        dayList.forEach((entry) => {
          if (!entry.done) {
            list.push({ ...entry, dateKey });
          }
        });
      }
    });

    list.sort((a, b) => {
      if (a.dateKey !== b.dateKey) {
        return a.dateKey.localeCompare(b.dateKey);
      }
      return (a.time || "").localeCompare(b.time || "");
    });

    return list.slice(0, 5);
  }, [entries, todayKey]);

  const changeMonth = (offset) => {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  // add/update 공통 payload 생성 헬퍼
  const buildPayload = (targetDateKey, entryData) => {
    const title = String(entryData.title || entryData.calTitle || "").trim();
    const rawTime = entryData.time || entryData.calTime || "09:00";
    const normalizedTime = rawTime.length === 5 ? `${rawTime}:00` : rawTime;
    const categoryId = entryData.categoryId || entryData.calCategory || "pack";

    return {
      title,
      normalizedTime,
      categoryId,
      payload: {
        calUserId: userId,
        calTaskDate: `${targetDateKey}T${normalizedTime}`,
        calTitle: title,
        calIsCompleted: entryData.done ? 1 : 0,
        calImgPath: entryData.calImgPath || "",
        calCategory: categoryId,
      },
    };
  };

  const handleAddEntry = async (...args) => {
  if (!userId) {
    alert("로그인이 필요합니다.");
    return false;
  }

  let entryData = {};
  if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
    entryData = args[0];
  } else {
    const [dateKey, title, time, categoryId] = args;
    entryData = { dateKey, title, time, categoryId };
  }

  const targetDateKey = entryData.dateKey || selectedKey;
  const { title, normalizedTime, categoryId, payload } = buildPayload(
    targetDateKey,
    entryData
  );

  if (!title) {
    alert("일정 제목을 입력해주세요.");
    return false;
  }

  try {
    const response = await setCalInsert(payload);
    const savedEntry = response.data || {};

    setEntries((prev) => ({
      ...prev,
      [targetDateKey]: [
        ...(prev[targetDateKey] || []),
        {
          id: savedEntry.calCode || Date.now(),
          title: savedEntry.calTitle || title,
          time: normalizedTime.substring(0, 5),
          categoryId: savedEntry.calCategory || categoryId,
          done: savedEntry.calIsCompleted === 1,
        },
      ],
    }));

    if (!entryData.silent) {
      alert("일정이 저장되었습니다.");
    }
    return true;
  } catch (error) {
    console.error("일정 저장 실패:", error);
    if (!entryData.silent) {
      alert("저장에 실패했습니다. 서버 상태를 확인해주세요.");
    }
    return false;
  }
};

  // 일정 수정: setCalUpdate(calCode, data)
  const handleUpdateEntry = async (dateKey, entryId, updatedData) => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return false;
    }

    const newDateKey = updatedData.dateKey || dateKey;
    const { title, normalizedTime, categoryId, payload } = buildPayload(
      newDateKey,
      updatedData
    );

    if (!title) {
      alert("일정 제목을 입력해주세요.");
      return false;
    }

    try {
      const response = await setCalUpdate(entryId, payload);
      const saved = response.data || {};

      setEntries((prev) => {
        const next = { ...prev };

        // 기존 날짜에서 제거
        next[dateKey] = (next[dateKey] || []).filter(
          (entry) => entry.id !== entryId
        );

        const updatedEntry = {
          id: entryId,
          title: saved.calTitle || title,
          time: normalizedTime.substring(0, 5),
          categoryId: saved.calCategory || categoryId,
          done: (saved.calIsCompleted ?? (updatedData.done ? 1 : 0)) === 1,
        };

        next[newDateKey] = [...(next[newDateKey] || []), updatedEntry];

        return next;
      });

      alert("일정이 수정되었습니다.");
      return true;
    } catch (error) {
      console.error("일정 수정 실패:", error);
      alert("수정에 실패했습니다. 서버 상태를 확인해주세요.");
      return false;
    }
  };

  // 일정 삭제: setCaldel(calCode)
  const handleDeleteEntry = async (dateKey, entryId) => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return false;
    }

    if (!window.confirm("이 일정을 삭제하시겠습니까?")) {
      return false;
    }

    try {
      await setCaldel(entryId);

      setEntries((prev) => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(
          (entry) => entry.id !== entryId
        ),
      }));

      return true;
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      alert("삭제에 실패했습니다. 서버 상태를 확인해주세요.");
      return false;
    }
  };

  const toggleEntryDone = (dateKey, entryId) => {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((entry) =>
        entry.id === entryId ? { ...entry, done: !entry.done } : entry
      ),
    }));
  };

  const selectedDateLabel = useMemo(() => {
    const [, month, day] = selectedKey.split("-");
    return `${month}월 ${day}일`;
  }, [selectedKey]);

  const todayTodos = sortByTime(entries[todayKey] || []);

  return (
    <div className="main_app">
      <div className="main_grid">
        <div className="main_col main_col_left">
          <section className="card calendar_card">
            <CalendarCard
              viewMonth={viewMonth}
              onChangeMonth={changeMonth}
              todayKey={todayKey}
              selectedKey={selectedKey}
              onSelectDate={setSelectedKey}
              entries={entries}
              getCategory={getCategory}
              streakCount={streakCount}
            />

            <EntryPanel
              selectedKey={selectedKey}
              selectedDateLabel={selectedDateLabel}
              entries={entries}
              categories={categories}
              getCategory={getCategory}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onToggleDone={toggleEntryDone}
            />
          </section>
        </div>

        <div className="main_col main_col_right">
          <CommunityList />

          <TodoList
            todayTodos={todayTodos}
            getCategory={getCategory}
            todayKey={todayKey}
            onToggleDone={toggleEntryDone}
          />

          <UpcomingList
            upcomingEntries={upcomingEntries}
            getCategory={getCategory}
          />

          <AnalysisButtons onNavigate={navigate} />
        </div>
      </div>
    </div>
  );
}

export default MainPage;