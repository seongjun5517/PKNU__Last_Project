function TodoCard({ todayTodos, getCategory, todayKey, onToggleDone }) {
  return (
    <section className="card todo_card">
      <h2>오늘의 할일</h2>
      {todayTodos.length === 0 ? (
        <p className="todo_empty">오늘 등록된 일정이 없어요. 달력에서 오늘 날짜를 눌러 추가해보세요.</p>
      ) : (
        <ul className="todo_list">
          {todayTodos.map((todo) => {
            const cat = getCategory(todo.categoryId);
            return (
              <li key={todo.id} className={todo.done ? "done" : ""}>
                <span className="todo_left">
                  <span className="todo_dot" style={{ backgroundColor: cat.color }} />
                  {todo.time && <span className="todo_time">{todo.time}</span>}
                  <span className="todo_text">{todo.title}</span>
                </span>
                <label className="check_control">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => onToggleDone(todayKey, todo.id)}
                  />
                  <span className="check_mark" />
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default TodoCard;