const DAY_MS = 24 * 60 * 60 * 1000;
const dayNames = ["月", "火", "水", "木", "金", "土", "日"];

const last30TotalEl = document.getElementById("last30Total");
const last30AverageEl = document.getElementById("last30Average");
const thisWeekTotalEl = document.getElementById("thisWeekTotal");
const weekGridEl = document.getElementById("weekGrid");
const weekLabelEl = document.getElementById("weekLabel");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");

function timeToMinutes(time) {
  const [hours, minutes = "0"] = String(time).split(":");
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

const dataMap = new Map(STUDY_DATA.map(item => [item.date, timeToMinutes(item.time)]));

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  return result;
}

function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
}

function formatCompactDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (minutes === 0) return "—";
  if (mins === 0) return `${hours}h`;
  return `${hours}h${String(mins).padStart(2, "0")}m`;
}

function formatMonthDay(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function sumRange(start, end) {
  let total = 0;
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    total += dataMap.get(toDateKey(d)) || 0;
  }
  return total;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const thirtyDaysAgo = addDays(today, -29);
const currentWeekStart = startOfWeek(today);
const currentWeekEnd = addDays(currentWeekStart, 6);

const last30Total = sumRange(thirtyDaysAgo, today);
last30TotalEl.textContent = formatDuration(last30Total);
last30AverageEl.textContent = formatDuration(last30Total / 30);
thisWeekTotalEl.textContent = formatDuration(sumRange(currentWeekStart, currentWeekEnd));

const datedEntries = STUDY_DATA
  .map(item => parseLocalDate(item.date))
  .sort((a, b) => a - b);

const earliestWeekStart = datedEntries.length
  ? startOfWeek(datedEntries[0])
  : currentWeekStart;

let weekOffset = 0;

function renderWeek() {
  const weekStart = addDays(currentWeekStart, weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);

  weekLabelEl.textContent = `${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)}`;
  weekGridEl.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const minutes = dataMap.get(toDateKey(date)) || 0;

    const card = document.createElement("div");
    card.className = `day-card${minutes === 0 ? " empty" : ""}`;
    card.innerHTML = `
      <span>${dayNames[i]}</span>
      <small>${formatMonthDay(date)}</small>
      <strong>${formatCompactDuration(minutes)}</strong>
    `;
    weekGridEl.appendChild(card);
  }

  nextWeekBtn.disabled = weekOffset === 0;
  prevWeekBtn.disabled = weekStart <= earliestWeekStart;
}

prevWeekBtn.addEventListener("click", () => {
  if (!prevWeekBtn.disabled) {
    weekOffset -= 1;
    renderWeek();
  }
});

nextWeekBtn.addEventListener("click", () => {
  if (weekOffset < 0) {
    weekOffset += 1;
    renderWeek();
  }
});

renderWeek();
