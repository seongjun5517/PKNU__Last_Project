import { formatDateLabel } from "../../utils/dateUtils";

function UpcomingList({ upcomingEntries, getCategory }) {
  return (
    <section className="card upcoming_card">
      <h2>다가오는 일정</h2>
      {upcomingEntries.length === 0 ? (
        <p className="todo_empty">예정된 일정이 없어요.</p>
      ) : (
        <ul className="upcoming_list">
          {upcomingEntries.map((entry) => {
            const cat = getCategory(entry.categoryId);
            return (
              <li key={entry.id}>
                <span className="upcoming_dot" style={{ backgroundColor: cat.color }} />
                <span className="upcoming_date">{formatDateLabel(entry.dateKey)}</span>
                {entry.time && <span className="upcoming_time">{entry.time}</span>}
                <span className="upcoming_title">{entry.title}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default UpcomingList;