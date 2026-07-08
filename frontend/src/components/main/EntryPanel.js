import { useState } from "react";
import { PALETTE, sortByTime, toDateKey } from "../../utils/dateUtils";

function EntryPanel({
  selectedKey,
  selectedDateLabel,
  entries,
  getCategory,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onToggleDone,
}) {
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
  const [repeatEndDate, setRepeatEndDate] = useState(""); // "YYYY-MM-DD"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수정 중인 항목 id (null이면 수정 모드 아님)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("pack");

  const selectedEntries = sortByTime(entries[selectedKey] || []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { id, name: newCategoryName.trim(), color: newCategoryColor }]);
    setSelectedCategoryId(id);
    setNewCategoryName("");
    setNewCategoryColor(PALETTE[0]);
    setShowNewCategory(false);
  };

  const toggleRepeatDay = (dayIdx) => {
    setRepeatDays((prev) => (prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx]));
  };

  // selectedKey부터 repeatEndDate까지, repeatDays에 해당하는 요일의 dateKey 목록 생성
  const buildRepeatDateKeys = () => {
    if (!repeatEndDate) return [];

    const start = new Date(`${selectedKey}T00:00:00`);
    const end = new Date(`${repeatEndDate}T00:00:00`);

    if (end < start) return [];

    const dateKeys = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      if (repeatDays.includes(cursor.getDay())) {
        dateKeys.push(toDateKey(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return dateKeys;
  };

  const handleSubmit = async () => {
    if (!titleInput.trim() || isSubmitting) return;

    if (repeatOn) {
      if (repeatDays.length === 0) {
        alert("반복할 요일을 선택해주세요.");
        return;
      }
      if (!repeatEndDate) {
        alert("반복 종료일을 선택해주세요.");
        return;
      }

      const dateKeys = buildRepeatDateKeys();

      if (dateKeys.length === 0) {
        alert("선택한 조건에 해당하는 날짜가 없습니다. 종료일을 확인해주세요.");
        return;
      }

      setIsSubmitting(true);

      let successCount = 0;
      // 서버에 순차적으로 요청 (동시에 많이 보내면 id 충돌/부하 우려)
      for (const dateKey of dateKeys) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await onAddEntry({
          dateKey,
          title: titleInput,
          time: timeInput,
          categoryId: selectedCategoryId,
          silent: true, // 반복 추가 되는건 개별 알람 생략
        });
        if (ok) successCount += 1;
      }

      setIsSubmitting(false);

      if (successCount > 0) {
        setTitleInput("");
        setTimeInput("");
        setRepeatOn(false);
        setRepeatDays([]);
        setRepeatEndDate("");
        alert(`${successCount}개의 반복 일정이 추가되었습니다.`);
      }
      return;
    }

    const ok = await onAddEntry({
      dateKey: selectedKey,
      title: titleInput,
      time: timeInput,
      categoryId: selectedCategoryId,
    });
    if (ok) {
      setTitleInput("");
      setTimeInput("");
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditTime(entry.time || "");
    setEditCategoryId(entry.categoryId || "pack");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditTime("");
    setEditCategoryId("pack");
  };

  const submitEdit = async (entry) => {
    if (!editTitle.trim()) return;
    const ok = await onUpdateEntry(selectedKey, entry.id, {
      dateKey: selectedKey,
      title: editTitle,
      time: editTime,
      categoryId: editCategoryId,
      done: entry.done,
    });
    if (ok) cancelEdit();
  };

  const handleDelete = async (entry) => {
    await onDeleteEntry(selectedKey, entry.id);
    if (editingId === entry.id) cancelEdit();
  };

  return (
    <div className="entry_panel">
      <p className="entry_panel_title">{selectedDateLabel}에 일정 추가</p>

      <input
        type="text"
        className="title_input"
        placeholder="무슨 일정인가요? 예: 팩 하기"
        value={titleInput}
        onChange={(e) => setTitleInput(e.target.value)}
      />
      {/* <input type="time" className="time_input" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} /> */}
      {/* 시간 입력 부분 */}
      <div className="field_group">
        <label className="field_label" htmlFor="entry-time-input">시간</label>
        <div className="input_with_overlay">
          <input
            id="entry-time-input"
            type="time"
            className={`time_input${!timeInput ? " is_empty" : ""}`}
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
          />
          {!timeInput && <span className="input_overlay_text">시간을 선택하세요</span>}
        </div>
      </div>
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
        <button type="button" className="category_chip add_chip" onClick={() => setShowNewCategory((v) => !v)}>
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
          <button type="button" className="new_category_confirm" onClick={handleAddCategory}>추가</button>
        </div>
      )}

      <label className="repeat_toggle">
        <input type="checkbox" checked={repeatOn} onChange={(e) => setRepeatOn(e.target.checked)} />
        <span>매주 반복</span>
      </label>

      {repeatOn && (
        <div className="repeat_box">
          <div className="repeat_days">
            {["일","월","화","수","목","금","토"].map((w, idx) => (
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

          {/* 일정 반복 종료일 */}
          <label className="repeat_end_label">
            종료일
            <div className="input_with_overlay">
              <input
                type="date"
                className={`repeat_end_input${!repeatEndDate ? " is_empty" : ""}`}
                min={selectedKey}
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
              {!repeatEndDate && <span className="input_overlay_text">종료일을 선택하세요</span>}
            </div>
          </label>
        </div>
      )}

      <button
        type="button"
        className="entry_add_button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "추가 중..." : "일정 추가"}
      </button>

      {selectedEntries.length > 0 && (
        <ul className="entry_list">
          {selectedEntries.map((entry) => {
            const cat = getCategory(entry.categoryId);
            const isEditing = editingId === entry.id;

            if (isEditing) {
              return (
                <li key={entry.id} className="editing">
                  <input
                    type="text"
                    className="edit_title_input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="일정 제목"
                  />
                  <input
                    type="time"
                    className="edit_time_input"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                  <select
                    className="edit_category_select"
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button type="button" className="edit_save_btn" onClick={() => submitEdit(entry)}>
                    저장
                  </button>
                  <button type="button" className="edit_cancel_btn" onClick={cancelEdit}>
                    취소
                  </button>
                </li>
              );
            }

            return (
              <li key={entry.id} className={entry.done ? "done" : ""}>
                <span className="entry_dot" style={{ backgroundColor: cat.color }} />
                {entry.time && <span className="entry_time">{entry.time}</span>}
                <span className="entry_text">{entry.title}</span>

                <button
                  type="button"
                  className="entry_edit_btn"
                  onClick={() => startEdit(entry)}
                  aria-label="일정 수정"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="entry_delete_btn"
                  onClick={() => handleDelete(entry)}
                  aria-label="일정 삭제"
                >
                  🗑️
                </button>

                <label className="check_control">
                  <input type="checkbox" checked={entry.done} onChange={() => onToggleDone(selectedKey, entry.id)} />
                  <span className="check_mark" />
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default EntryPanel;