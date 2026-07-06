import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MainPage.css";
import { setCalInsert } from "../springApi/CalendarSpringBootApi";
import { getCalList } from "../springApi/CalendarSpringBootApi"; // 2. get 함수 임포트 가정

import { useEffect } from "react";



const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const PALETTE = ["#BD6F63", "#7C9B82", "#D9A441", "#8B6FA6", "#6C93B8", "#B4657A"];
const REPEAT_RANGE_DAYS = 90;



function toDateKey(date) {
    


    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
    }

function formatDateLabel(dateKey) {
    const d = new Date(`${dateKey}T00:00:00`);
    return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`;
}

function sortByTime(list) {
    return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}

function MainPage() {
    const navigate = useNavigate();
    const today = useMemo(() => new Date(), []);
    const todayKey = toDateKey(today);

    const [viewMonth, setViewMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
  );
    const [selectedKey, setSelectedKey] = useState(todayKey);

    // { "2026-07-03": [{ id, title, time, categoryId, done, repeatGroupId? }] }
    const [entries, setEntries] = useState({});

    // 데이터 불러오기 함수
    useEffect(() => {
        const fetchEntries = async () => {
            try {
            const response = await getCalList("sooping"); // 유저 ID 전달
            // 서버 데이터 구조에 맞게 변환 (예: [{calDate, calTitle, ...}, ...])
            const fetchedData = response.data.reduce((acc, item) => {
                const dateKey = item.calTaskDate; // 'YYYY-MM-DD' 형식
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push({
                id: item.calCode,
                title: item.calTitle,
                time: item.calTime, // 시간 데이터
                categoryId: item.calCategory,
                done: item.calIsCompleted === 1
                });
                return acc;
            }, {});
            setEntries(fetchedData);
            } catch (error) {
            console.error("데이터 로딩 실패:", error);
            }
        };
        fetchEntries();
        }, []);

    const [categories, setCategories] = useState([
        { id: "pack", name: "팩", color: "#BD6F63" },
        { id: "procedure", name: "시술", color: "#7C9B82" },
    ]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("pack");
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState(PALETTE[0]);

    const [titleInput, setTitleInput] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const [repeatOn, setRepeatOn] = useState(false);
    const [repeatDays, setRepeatDays] = useState([]);

    const popularPosts = [
        { id: 1, title: "여름철 유수분 밸런스 관리 꿀팁", likes: 128 },
        { id: 2, title: "트러블 진정 루틴 3주 후기", likes: 96 },
        { id: 3, title: "각질 관리, 이 순서로 해보세요", likes: 74 },
    ];

    const getCategory = (id) =>
        categories.find((c) => c.id === id) || { name: "", color: "#A79FB0" };

    const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(new Date(year, month, day));
    }
    return cells;
    }, [viewMonth]);

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
                dayList.forEach((entry) => {
                    if (!entry.done) list.push({ ...entry, dateKey });
                });
            }
        });
    list.sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
        return (a.time || "").localeCompare(b.time || "");
    });
    return list.slice(0, 5);
    }, [entries, todayKey]);

    const changeMonth = (offset) => {
        setViewMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
        );
    };
  
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        const id = `cat-${Date.now()}`;
        setCategories((prev) => [
        ...prev,
        { id, name: newCategoryName.trim(), color: newCategoryColor },
        ]);
        setSelectedCategoryId(id);
        setNewCategoryName("");
        setNewCategoryColor(PALETTE[0]);
        setShowNewCategory(false);
    };

    const toggleRepeatDay = (dayIdx) => {
        setRepeatDays((prev) =>
        prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx]
        );
    };

    const handleAddEntry = async () => {
    if (!titleInput.trim()) return;

        const newEntry = {
            calUserId: "sooping",              // 현재 로그인된 유저 ID 필요
            calTaskDate: selectedKey,          // "2026-07-03" 형식
            calTitle: titleInput.trim(),       // 제목
            calDescription: "",                // 필요 시 추가
            calIsCompleted: 0,                 // 0: 미완료, 1: 완료
            calImgPath: "imgpath",                    // 이미지 경로
            calCategory: selectedCategoryId    // 카테고리
        };

    try {
        // API 호출
        const response = await setCalInsert(newEntry);
        
        // 서버에서 반환된 ID가 있다면 그것을 사용 (로컬 데이터와 동기화)
        const savedEntry = response.data; 

        // 상태 업데이트
        setEntries((prev) => ({
            ...prev,
            [selectedKey]: [
            ...(prev[selectedKey] || []),
            { 
                ...newEntry, 
                id: savedEntry.calCode || Date.now(), // DB에서 받은 ID 우선
                title: newEntry.calTitle,
                categoryId: newEntry.calCategory,
                done: false 
            }
            ],
        }));

      // 입력창 초기화
      setTitleInput("");
      setTimeInput("");
      alert("일정이 저장되었습니다!");
    } catch (error) {
      console.error("서버 저장 실패:", error);
      alert("저장에 실패했습니다. 서버 상태를 확인해주세요.");
    }};

  const toggleEntryDone = (dateKey, entryId) => {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((entry) =>
        entry.id === entryId ? { ...entry, done: !entry.done } : entry
      ),
    }));
  };

  const selectedDateLabel = useMemo(() => {
    const [, m, d] = selectedKey.split("-");
    return `${m}월 ${d}일`;
  }, [selectedKey]);

  const selectedEntries = sortByTime(entries[selectedKey] || []);
  const todayTodos = sortByTime(entries[todayKey] || []);

  return (
    <div className="main_app">
      <header className="main_header">
        <div>
          <p className="main_eyebrow">SKIN DIARY</p>
          <p className="main_logo">Triple Skin</p>
        </div>
        <button
          type="button"
          className="mypage_link"
          onClick={() => navigate("/mypage")}
        >
          마이페이지
        </button>
      </header>

      <div className="main_grid">
        {/* 좌측: 달력 + 오늘의 할일 */}
        <div className="main_col main_col_left">
          <section className="card calendar_card">
            <div className="calendar_top">
              <div className="calendar_nav">
                <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달">
                  ‹
                </button>
                <h2>
                  {viewMonth.getFullYear()}. {String(viewMonth.getMonth() + 1).padStart(2, "0")}
                </h2>
                <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달">
                  ›
                </button>
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
                if (!date) {
                  return <div key={`empty-${idx}`} className="calendar_cell empty" />;
                }
                const key = toDateKey(date);
                const dayEntries = sortByTime(entries[key] || []);
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;

                return (
                  <button
                    type="button"
                    key={key}
                    className={`calendar_cell${isSelected ? " selected" : ""}${
                      isToday ? " today" : ""
                    }`}
                    onClick={() => setSelectedKey(key)}
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
                        {dayEntries.length > 2 && (
                          <li className="cell_more">+{dayEntries.length - 2}</li>
                        )}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="entry_panel">
              <p className="entry_panel_title">{selectedDateLabel}에 일정 추가</p>

              <input
                type="text"
                className="title_input"
                placeholder="무슨 일정인가요? 예: 팩 하기"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />

              <input
                type="time"
                className="time_input"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
              />

              <div className="category_row">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category_chip${selectedCategoryId === cat.id ? " active" : ""}`}
                    style={{ "--chip-color": cat.color }}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    <span className="chip_dot" />
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  className="category_chip add_chip"
                  onClick={() => setShowNewCategory((v) => !v)}
                >
                  + 새 카테고리
                </button>
              </div>

              {showNewCategory && (
                <div className="new_category_box">
                  <input
                    type="text"
                    className="new_category_input"
                    placeholder="카테고리 이름"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <div className="palette_row">
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`palette_swatch${newCategoryColor === color ? " active" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategoryColor(color)}
                        aria-label={color}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="new_category_confirm"
                    onClick={handleAddCategory}
                  >
                    추가
                  </button>
                </div>
              )}

              <label className="repeat_toggle">
                <input
                  type="checkbox"
                  checked={repeatOn}
                  onChange={(e) => setRepeatOn(e.target.checked)}
                />
                <span>매주 반복</span>
              </label>

              {repeatOn && (
                <div className="repeat_days">
                  {WEEKDAYS.map((w, idx) => (
                    <button
                      key={w}
                      type="button"
                      className={`day_toggle${repeatDays.includes(idx) ? " active" : ""}`}
                      onClick={() => toggleRepeatDay(idx)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}

              <button type="button" className="entry_add_button" onClick={handleAddEntry}>
                일정 추가
              </button>

              {selectedEntries.length > 0 && (
                <ul className="entry_list">
                  {selectedEntries.map((entry) => {
                    const cat = getCategory(entry.categoryId);
                    return (
                      <li key={entry.id} className={entry.done ? "done" : ""}>
                        <span className="entry_dot" style={{ backgroundColor: cat.color }} />
                        {entry.time && <span className="entry_time">{entry.time}</span>}
                        <span className="entry_text">{entry.title}</span>
                        <label className="check_control">
                          <input
                            type="checkbox"
                            checked={entry.done}
                            onChange={() => toggleEntryDone(selectedKey, entry.id)}
                          />
                          <span className="check_mark" />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* 우측: 커뮤니티 인기글 + 오늘의 할일 + 다가오는 일정 + 분석하러 가기 */}
        <div className="main_col main_col_right">
          <section className="card community_card">
            <div className="card_header_row">
              <h2>커뮤니티 인기글</h2>
              <button
                type="button"
                className="card_link_button"
                onClick={() => navigate("/community")}
              >
                커뮤니티 보러가기 ›
              </button>
            </div>
            <ul className="community_list">
              {popularPosts.map((post, idx) => (
                <li key={post.id}>
                  <span className="post_rank">{String(idx + 1).padStart(2, "0")}</span>
                  <Link className="post_title" to={`/community/${post.id}`}>
                    {post.title}
                  </Link>
                  <span className="post_likes">♥ {post.likes}</span>
                </li>
              ))}
            </ul>
          </section>

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
                          onChange={() => toggleEntryDone(todayKey, todo.id)}
                        />
                        <span className="check_mark" />
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

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

          <button
            type="button"
            className="analysis_button"
            onClick={() => navigate("/analysis")}
          >
            <span className="analysis_ring" aria-hidden="true" />
            <span className="analysis_label">
              피부 분석하러 가기
              <span className="analysis_sub">사진 한 장으로 지금 상태 확인하기</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;