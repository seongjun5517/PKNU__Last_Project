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
import { setCalInsert } from "../springApi/CalendarSpringBootApi";
import { getCalList } from "../springApi/CalendarSpringBootApi"; // 2. get 함수 임포트 가정
import { useAuth } from "../context/AuthContext";

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

// 로그인 시 localStorage에 저장해둔 사용자 아이디를 가져옵니다.
// 실제로 로그인 코드에서 localStorage.setItem("여기 키 이름", ...) 으로
// 저장하신 키 이름과 다르면 아래 "userId" 부분만 그 키 이름으로 바꿔주세요.
// function getLoginUserId() {
//     return localStorage.getItem("userId");
// }

function MainPage() {
    const { userId } = useAuth();
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
        if (!userId) {
            console.warn("로그인 정보가 없습니다. 캘린더를 불러올 수 없습니다.");
            return;
        }
        try {
            const response = await getCalList(loginUserId);

            const fetchedData = response.data.reduce((acc, item) => {
                // 서버 응답이 "2026-07-06 14:30:00"(공백) 이든
                // "2026-07-06T14:30:00"(ISO, T) 이든 상관없이
                // 앞 10자리는 항상 "yyyy-MM-dd" 이고,
                // 10번째 인덱스(구분자) 다음 5자리가 "HH:mm" 이므로
                // split이 아니라 고정 위치(substring)로 잘라야 안전합니다.
                const raw = String(item.calTaskDate);
                const dateKey = raw.substring(0, 10);   // "2026-07-06"
                const timeOnly = raw.substring(11, 16); // "14:30"

                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push({
                    id: item.calCode,
                    title: item.calTitle,
                    time: timeOnly || item.calTime,
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

    
    if (!userId) {
        alert("로그인이 필요합니다.");
        return;
    }

    const combinedDateTime = timeInput 
        ? `${selectedKey}T${timeInput}:00` 
        : `${selectedKey}T09:00:00`;

        const newEntry = {
            calUserId: loginUserId,                 // 로그인한 사용자 아이디
            calTaskDate: combinedDateTime,          // "2026-07-03" 형식
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