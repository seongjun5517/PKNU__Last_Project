import { useMemo } from "react";
import { WEEKDAYS, toDateKey, sortByTime } from "../../utils/dateUtils";

function CalendarCard({
  viewMonth,
  onChangeMonth,
  todayKey,
  selectedKey,
  onSelectDate,
  entries,
  getCategory,
  streakCount,
}) {
  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    return cells;
  }, [viewMonth]);

  return (
    <>
      <div className="calendar_top">
        <div className="calendar_nav">
          <button type="button" onClick={() => onChangeMonth(-1)} aria-label="이전 달">‹</button>
          <h2>
            {viewMonth.getFullYear()}. {String(viewMonth.getMonth() + 1).padStart(2, "0")}
          </h2>
          <button type="button" onClick={() => onChangeMonth(1)} aria-label="다음 달">›</button>
        </div>
        {streakCount > 0 && (
          <div className="streak_badge">
            <span className="streak_dot" />
            {streakCount}일 연속 기록 중
          </div>
        )}
      </div>

      <div className="calendar_weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="calendar_grid">
        {calendarCells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="calendar_cell empty" />;
          const key = toDateKey(date);
          const dayEntries = sortByTime(entries[key] || []);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;

          return (
            <button
              type="button"
              key={key}
              className={`calendar_cell${isSelected ? " selected" : ""}${isToday ? " today" : ""}`}
              onClick={() => onSelectDate(key)}
            >
              <span className="cell_day">{date.getDate()}</span>
              {dayEntries.length > 0 && (
                <ul className="cell_entries">
                  {dayEntries.slice(0, 2).map((entry) => {
                    const cat = getCategory(entry.categoryId);
                    return (
                      <li key={entry.id} className={entry.done ? "done" : ""}>
                        <span className="cell_dot" style={{ backgroundColor: cat.color }} />
                        {entry.title}
                      </li>
                    );
                  })}
                  {dayEntries.length > 2 && <li className="cell_more">+{dayEntries.length - 2}</li>}
                </ul>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default CalendarCard;