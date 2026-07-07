import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import { useCalendarEntries } from "../hooks/useCalendarEntries";
import { toDateKey, sortByTime } from "../utils/dateUtils";
import CalendarCard from "../components/main/CalendarCard";
import EntryPanel from "../components/main/EntryPanel";
import CommunityList from "../components/main/CommunityList";
import TodoList from "../components/main/TodoList";
import UpcomingList from "../components/main/UpcomingList";
import AnalysisButtons from "../components/main/AnalysisButtons";

function MainPage() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [categories] = useState([
    { id: "pack", name: "팩", color: "#BD6F63" },
    { id: "procedure", name: "시술", color: "#7C9B82" },
  ]);

  const { entries, addEntry, toggleEntryDone } = useCalendarEntries();

  const getCategory = (id) => categories.find((c) => c.id === id) || { name: "", color: "#A79FB0" };

  const streakCount = useMemo(() => {
    let count = 0;
    const cursor = new Date(today);
    while (true) {
      const key = toDateKey(cursor);
      if ((entries[key] || []).length > 0) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return count;
  }, [entries, today]);

  const upcomingEntries = useMemo(() => {
    const todayStart = new Date(`${todayKey}T00:00:00`);
    const list = [];
    Object.entries(entries).forEach(([dateKey, dayList]) => {
      const d = new Date(`${dateKey}T00:00:00`);
      if (d >= todayStart) {
        dayList.forEach((entry) => { if (!entry.done) list.push({ ...entry, dateKey }); });
      }
    });
    list.sort((a, b) => (a.dateKey !== b.dateKey ? a.dateKey.localeCompare(b.dateKey) : (a.time || "").localeCompare(b.time || "")));
    return list.slice(0, 5);
  }, [entries, todayKey]);

  const changeMonth = (offset) => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));

  const selectedDateLabel = useMemo(() => {
    const [, m, d] = selectedKey.split("-");
    return `${m}월 ${d}일`;
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
              getCategory={getCategory}
              onAddEntry={addEntry}
              onToggleDone={toggleEntryDone}
            />
          </section>
        </div>

        <div className="main_col main_col_right">
        <CommunityList />
        <TodoList todayTodos={todayTodos} getCategory={getCategory} todayKey={todayKey} onToggleDone={toggleEntryDone} />
        <UpcomingList upcomingEntries={upcomingEntries} getCategory={getCategory} />
        <AnalysisButtons onNavigate={navigate} />
        </div>
      </div>
    </div>
  );
}

export default MainPage;