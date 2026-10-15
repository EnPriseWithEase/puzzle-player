import { getDailyReviewCounts, getTodaysReviewStats } from "./database-usage.js";

export async function createStatisticsSection() {
  const section = document.createElement("section");
  section.className = "statistics-section";

  const heading = document.createElement("h2");
  heading.className = "statistics-heading";
  heading.textContent = "Statistics";

  const calendarContainer = document.createElement("div");
  calendarContainer.className = "statistics-calendar-container";

  section.append(heading, calendarContainer);

  const rows = await getDailyReviewCounts();

  const counts = Object.fromEntries(
    rows.map(row => [row.day, Number(row.count)])
  );

  renderHeatmap(calendarContainer, counts);

  const todaysStats = document.createElement("div");
  todaysStats.className = "todays-statistics";
  todaysStats.textContent = await getTodaysStats();

  section.appendChild(todaysStats)

  return section;
}

function renderHeatmap(container, counts) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Start on Sunday, 52 weeks before the current week.
  const start = new Date(today);
  start.setDate(start.getDate() - 52 * 7);
  start.setDate(start.getDate() - start.getDay());

  const maxCount = Math.max(0, ...Object.values(counts));

  const calendar = document.createElement("div");
  calendar.className = "statistics-calendar";

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getLevel(count) {
    if (count === 0 || maxCount === 0) return 0;

    return Math.min(4, Math.ceil(count / maxCount * 4));
  }

  for (let week = 0; week < 53; week++) {
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);

      const key = dateKey(date);
      const count = counts[key] || 0;

      const cell = document.createElement("div");
      cell.className = "statistics-day";
      cell.dataset.level = String(getLevel(count));
      cell.title = `${key}: ${count} puzzle${count === 1 ? "" : "s"}`;
      cell.setAttribute("aria-label", cell.title);

      if (date > today) {
        cell.style.visibility = "hidden";
      }

      calendar.appendChild(cell);
    }
  }

  container.appendChild(calendar);
}

async function getTodaysStats() {
  const { cards, elapsed, correct } = (await getTodaysReviewStats())[0];

  if (!cards) {
    return "No cards studied today";
  }

  const minutes = (elapsed / 1000 / 60).toFixed(1);
  const secondsPerCard = Math.round(elapsed / cards / 1000);
  const accuracy = Math.round(correct / cards * 100);

  return `Studied ${cards} cards in ${minutes} minutes today\n${secondsPerCard} s/card · ${accuracy}% correct`;
}

