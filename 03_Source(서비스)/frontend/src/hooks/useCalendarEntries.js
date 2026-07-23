import { useEffect, useState } from "react";
import { setCalInsert, getCalList } from "../springApi/CalendarSpringBootApi";
import { useAuth } from "../context/AuthContext";

export function useCalendarEntries() {
  const { userId, authLoading } = useAuth();
  const [entries, setEntries] = useState({});

  useEffect(() => {
    const fetchEntries = async () => {
      if (authLoading) return;
      if (!userId) {
        console.warn("로그인 정보가 없습니다. 캘린더를 불러올 수 없습니다.");
        setEntries({});
        return;
      }
      try {
        const response = await getCalList();
        const fetchedData = response.data.reduce((acc, item) => {
          const raw = String(item.calTaskDate);
          const dateKey = raw.substring(0, 10);
          const timeOnly = raw.substring(11, 16);
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push({
            id: item.calCode,
            title: item.calTitle,
            time: timeOnly || item.calTime,
            categoryId: item.calCategory,
            done: item.calIsCompleted === 1,
          });
          return acc;
        }, {});
        setEntries(fetchedData);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchEntries();
  }, [authLoading, userId]);

  const addEntry = async ({ selectedKey, titleInput, timeInput, selectedCategoryId }) => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return false;
    }
    const combinedDateTime = timeInput
      ? `${selectedKey}T${timeInput}:00`
      : `${selectedKey}T09:00:00`;

    const newEntry = {
      calTaskDate: combinedDateTime,
      calTitle: titleInput.trim(),
      calDescription: "",
      calIsCompleted: 0,
      calImgPath: "imgpath",
      calCategory: selectedCategoryId,
    };

    try {
      const response = await setCalInsert(newEntry);
      const savedEntry = response.data;
      setEntries((prev) => ({
        ...prev,
        [selectedKey]: [
          ...(prev[selectedKey] || []),
          {
            ...newEntry,
            id: savedEntry.calCode || Date.now(),
            title: newEntry.calTitle,
            categoryId: newEntry.calCategory,
            done: false,
          },
        ],
      }));
      alert("일정이 저장되었습니다!");
      return true;
    } catch (error) {
      console.error("서버 저장 실패:", error);
      alert("저장에 실패했습니다. 서버 상태를 확인해주세요.");
      return false;
    }
  };

  const toggleEntryDone = (dateKey, entryId) => {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((entry) =>
        entry.id === entryId ? { ...entry, done: !entry.done } : entry
      ),
    }));
  };

  return { entries, addEntry, toggleEntryDone };
}
