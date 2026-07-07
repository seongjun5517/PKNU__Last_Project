import { useState } from "react";
import { PALETTE, sortByTime } from "../../utils/dateUtils";

function EntryPanel({ selectedKey, selectedDateLabel, entries, getCategory, onAddEntry, onToggleDone }) {
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

  const handleSubmit = async () => {
    if (!titleInput.trim()) return;
    const ok = await onAddEntry({ selectedKey, titleInput, timeInput, selectedCategoryId });
    if (ok) {
      setTitleInput("");
      setTimeInput("");
    }
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
      <input type="time" className="time_input" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />

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
      )}

      <button type="button" className="entry_add_button" onClick={handleSubmit}>일정 추가</button>

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