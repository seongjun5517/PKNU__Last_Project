export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export const PALETTE = ["#BD6F63", "#7C9B82", "#D9A441", "#8B6FA6", "#6C93B8", "#B4657A"];

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateLabel(dateKey) {
  const d = new Date(`${dateKey}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`;
}

export function sortByTime(list) {
  return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}
