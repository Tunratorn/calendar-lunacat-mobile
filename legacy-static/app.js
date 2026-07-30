const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const mockEvents = [
  {
    id: "evt-1",
    date: "2026-07-08",
    start: "09:00",
    end: "09:45",
    title: "Design review",
    note: "Mobile calendar layout pass",
    category: "work",
  },
  {
    id: "evt-2",
    date: "2026-07-08",
    start: "12:30",
    end: "13:30",
    title: "Lunch with Mina",
    note: "Samyan Mitrtown, floor 4",
    category: "personal",
  },
  {
    id: "evt-3",
    date: "2026-07-08",
    start: "15:00",
    end: "17:00",
    title: "Deep work",
    note: "Prototype event reminders",
    category: "focus",
  },
  {
    id: "evt-4",
    date: "2026-07-11",
    start: "10:00",
    end: "11:15",
    title: "Sprint planning",
    note: "Prioritize calendar interactions",
    category: "work",
  },
  {
    id: "evt-5",
    date: "2026-07-15",
    start: "18:30",
    end: "19:30",
    title: "Gym session",
    note: "Strength training",
    category: "personal",
  },
  {
    id: "evt-6",
    date: "2026-08-03",
    start: "14:00",
    end: "15:00",
    title: "Reminder QA",
    note: "Check push notification copy",
    category: "work",
  },
];

const sheet = document.querySelector("[data-sheet]");
const openSheetButton = document.querySelector("[data-open-sheet]");
const closeSheetButton = document.querySelector("[data-close-sheet]");
const infoSheet = document.querySelector("[data-info-sheet]");
const infoKicker = document.querySelector("[data-info-kicker]");
const infoTitle = document.querySelector("[data-info-title]");
const infoContent = document.querySelector("[data-info-content]");
const closeInfoButton = document.querySelector("[data-close-info]");
const form = document.querySelector(".event-form");
const filterButtons = document.querySelectorAll("[data-filter]");
const navButtons = document.querySelectorAll("[data-nav-view]");
const calendarGrid = document.querySelector("[data-calendar-grid]");
const agendaList = document.querySelector("[data-agenda-list]");
const phoneFrame = document.querySelector(".phone-frame");
const currentMonthLabel = document.querySelector("[data-current-month]");
const selectedWeekday = document.querySelector("[data-selected-weekday]");
const selectedDate = document.querySelector("[data-selected-date]");
const selectedSummary = document.querySelector("[data-selected-summary]");
const prevMonthButton = document.querySelector("[data-prev-month]");
const nextMonthButton = document.querySelector("[data-next-month]");
const todayButton = document.querySelector("[data-today-button]");
const menuButton = document.querySelector("[data-open-menu]");
const profileButton = document.querySelector("[data-open-profile]");
const sheetKicker = document.querySelector("[data-sheet-kicker]");
const sheetTitle = document.querySelector("[data-sheet-title]");
const saveButton = document.querySelector("[data-save-button]");
const formFields = form.elements;

const today = new Date(2026, 6, 8);
const storedEvents = JSON.parse(localStorage.getItem("lunacat-events") || "null");

let events = storedEvents || mockEvents;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDay = toDateKey(today);
let activeFilter = "all";
let activeView = "calendar";
let editingEventId = null;
let refreshTimer;

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function saveEvents() {
  localStorage.setItem("lunacat-events", JSON.stringify(events));
}

function getEventsForDate(dateKey) {
  return events
    .filter((event) => {
      const matchesDate = event.date === dateKey;
      const matchesFilter = activeFilter === "all" || event.category === activeFilter;
      return matchesDate && matchesFilter;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

function getAllEventsForDate(dateKey) {
  return events.filter((event) => event.date === dateKey);
}

function getDuration(start, end) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  if (minutes <= 0) {
    return "0m";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours && rest) {
    return `${hours}h ${rest}m`;
  }

  return hours ? `${hours}h` : `${rest}m`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCategoryClass(category) {
  return ["work", "personal", "focus"].includes(category) ? category : "work";
}

function renderHero() {
  const date = fromDateKey(selectedDay);
  const totalEvents = getEventsForDate(selectedDay).length;
  const eventLabel = totalEvents === 1 ? "event" : "events";

  selectedWeekday.textContent = weekdayNames[date.getDay()];
  selectedDate.textContent = `${monthNames[date.getMonth()]} ${date.getDate()}`;
  selectedSummary.textContent = `${totalEvents} ${eventLabel} scheduled`;
}

function renderCalendar() {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  currentMonthLabel.textContent = `${monthNames[month]} ${year}`;
  calendarGrid.innerHTML = "";

  for (let index = 0; index < 35; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const dateKey = toDateKey(date);
    const button = document.createElement("button");
    const isCurrentMonth = date.getMonth() === month;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dateEvents = getAllEventsForDate(dateKey);
    const hasEvent = dateEvents.length > 0;
    const dayNumber = document.createElement("span");

    button.type = "button";
    button.className = "day";
    dayNumber.className = "day-number";
    dayNumber.textContent = date.getDate();
    button.append(dayNumber);
    button.dataset.date = dateKey;
    button.setAttribute("aria-label", `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`);

    if (!isCurrentMonth) {
      button.classList.add("muted");
    }

    if (isWeekend) {
      button.classList.add("weekend");
    }

    if (hasEvent) {
      button.classList.add("has-event");
      button.setAttribute(
        "aria-label",
        `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${dateEvents.length} events`,
      );

      const count = document.createElement("span");
      count.className = "event-count";
      count.textContent = dateEvents.length;
      button.append(count);
    }

    if (dateKey === selectedDay) {
      button.classList.add("selected");
      button.setAttribute("aria-current", "date");
    }

    button.addEventListener("click", () => {
      selectedDay = dateKey;
      visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      render();
    });

    calendarGrid.append(button);
  }
}

function renderAgenda() {
  const dayEvents = getEventsForDate(selectedDay);
  agendaList.innerHTML = "";

  if (!dayEvents.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <strong>No events found</strong>
      <span>Try another filter or create a new event for this date.</span>
    `;
    agendaList.append(empty);
    return;
  }

  dayEvents.forEach((event) => {
    const item = document.createElement("button");
    const time = document.createElement("time");
    const content = document.createElement("div");
    const title = document.createElement("h3");
    const note = document.createElement("p");
    const duration = document.createElement("span");

    item.className = `event-item ${event.category}`;
    item.type = "button";
    item.setAttribute("aria-label", `Open ${event.title} details`);
    time.dateTime = `${event.date}T${event.start}`;
    time.textContent = event.start;
    title.textContent = event.title;
    note.textContent = event.note || "No notes";
    duration.className = "event-duration";
    duration.textContent = getDuration(event.start, event.end);

    content.append(title, note);
    item.append(time, content, duration);
    item.addEventListener("click", () => openEventDetail(event));
    agendaList.append(item);
  });
}

function renderFilters() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

function renderNav() {
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.navView === activeView);
  });
}

function animateRefresh() {
  window.clearTimeout(refreshTimer);
  phoneFrame.classList.remove("is-refreshing");
  requestAnimationFrame(() => {
    phoneFrame.classList.add("is-refreshing");
    refreshTimer = window.setTimeout(() => {
      phoneFrame.classList.remove("is-refreshing");
    }, 280);
  });
}

function render() {
  renderHero();
  renderCalendar();
  renderAgenda();
  renderFilters();
  renderNav();
  animateRefresh();
}

function openSheet(eventToEdit) {
  const isEditing = Boolean(eventToEdit);
  const date = fromDateKey(isEditing ? eventToEdit.date : selectedDay);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  editingEventId = isEditing ? eventToEdit.id : null;
  form.classList.remove("has-error");
  formFields.title.value = isEditing ? eventToEdit.title : "Planning session";
  formFields.start.value = isEditing ? eventToEdit.start : "16:30";
  formFields.end.value = isEditing ? eventToEdit.end : "17:15";
  formFields.note.value = isEditing ? eventToEdit.note || "" : "Discuss next sprint";
  form.dataset.date = `${date.getFullYear()}-${month}-${day}`;
  sheetKicker.textContent = isEditing ? "Edit" : "New";
  sheetTitle.textContent = isEditing ? "Edit event" : "Create event";
  saveButton.textContent = isEditing ? "Update event" : "Save event";
  sheet.hidden = false;
  closeSheetButton.focus();
}

function closeSheet() {
  sheet.hidden = true;
  editingEventId = null;
  openSheetButton.focus();
}

function deleteEvent(id) {
  if (!window.confirm("Delete this event?")) {
    return;
  }

  events = events.filter((item) => item.id !== id);
  saveEvents();
  closeInfoSheet();
  render();
}

function openInfoSheet({ kicker, title, html }) {
  infoKicker.textContent = kicker;
  infoTitle.textContent = title;
  infoContent.innerHTML = html;
  infoSheet.hidden = false;
  closeInfoButton.focus();
}

function closeInfoSheet() {
  infoSheet.hidden = true;
}

function openMenu() {
  openInfoSheet({
    kicker: "Menu",
    title: "My Calendars",
    html: `
      <div class="info-list">
        <button class="menu-row" type="button" data-menu-filter="work">
          <span class="color-dot work"></span>
          <span><strong>Work</strong><small>Product meetings and reviews</small></span>
        </button>
        <button class="menu-row" type="button" data-menu-filter="personal">
          <span class="color-dot personal"></span>
          <span><strong>Personal</strong><small>Health, friends, and errands</small></span>
        </button>
        <button class="menu-row" type="button" data-menu-filter="focus">
          <span class="color-dot focus"></span>
          <span><strong>Focus</strong><small>Protected deep work blocks</small></span>
        </button>
        <button class="menu-row" type="button" data-menu-reset>
          <span class="color-dot neutral"></span>
          <span><strong>Reset mock data</strong><small>Clear local events and reload defaults</small></span>
        </button>
      </div>
    `,
  });

  infoContent.querySelectorAll("[data-menu-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.menuFilter;
      closeInfoSheet();
      render();
    });
  });

  infoContent.querySelector("[data-menu-reset]").addEventListener("click", () => {
    localStorage.removeItem("lunacat-events");
    events = mockEvents;
    activeFilter = "all";
    closeInfoSheet();
    render();
  });
}

function openProfile() {
  openInfoSheet({
    kicker: "Profile",
    title: "Lunacat",
    html: `
      <div class="profile-panel">
        <div class="profile-avatar">LC</div>
        <strong>Lunacat Calendar</strong>
        <span>Demo account for stakeholder walkthrough</span>
      </div>
      <div class="info-list compact">
        <div class="stat-row"><span>Default calendar</span><strong>Work</strong></div>
        <div class="stat-row"><span>Timezone</span><strong>Asia/Bangkok</strong></div>
        <div class="stat-row"><span>Reminders</span><strong>15 min before</strong></div>
      </div>
    `,
  });
}

function openEventDetail(event) {
  const date = fromDateKey(event.date);
  const categoryClass = getCategoryClass(event.category);
  const safeCategory = escapeHtml(event.category);
  const safeNote = escapeHtml(event.note || "No notes");

  openInfoSheet({
    kicker: event.category,
    title: event.title,
    html: `
      <div class="detail-card ${categoryClass}">
        <strong>${weekdayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}</strong>
        <span>${event.start} - ${event.end} · ${getDuration(event.start, event.end)}</span>
        <p>${safeNote}</p>
      </div>
      <div class="info-list compact">
        <div class="stat-row"><span>Calendar</span><strong>${safeCategory}</strong></div>
        <div class="stat-row"><span>Status</span><strong>Confirmed</strong></div>
        <div class="stat-row"><span>Reminder</span><strong>15 minutes before</strong></div>
      </div>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-edit-event>Edit</button>
        <button class="danger-button" type="button" data-delete-event>Delete</button>
      </div>
    `,
  });

  infoContent.querySelector("[data-edit-event]").addEventListener("click", () => {
    closeInfoSheet();
    openSheet(event);
  });

  infoContent.querySelector("[data-delete-event]").addEventListener("click", () => {
    deleteEvent(event.id);
  });
}

function openNavView(view) {
  activeView = view;
  renderNav();

  if (view === "calendar") {
    return;
  }

  if (view === "tasks") {
    openInfoSheet({
      kicker: "Tasks",
      title: "Today Checklist",
      html: `
        <div class="info-list">
          <div class="task-row done"><span></span><strong>Confirm design review notes</strong></div>
          <div class="task-row"><span></span><strong>Prepare reminder prototype</strong></div>
          <div class="task-row"><span></span><strong>Send lunch location</strong></div>
        </div>
      `,
    });
    return;
  }

  openInfoSheet({
    kicker: "Stats",
    title: "Week Snapshot",
    html: `
      <div class="stats-grid">
        <div><strong>12</strong><span>Events</span></div>
        <div><strong>7h</strong><span>Focus</span></div>
        <div><strong>4</strong><span>Free blocks</span></div>
      </div>
      <div class="info-list compact">
        <div class="stat-row"><span>Busiest day</span><strong>Wednesday</strong></div>
        <div class="stat-row"><span>Top calendar</span><strong>Work</strong></div>
      </div>
    `,
  });
}

openSheetButton.addEventListener("click", () => openSheet());
closeSheetButton.addEventListener("click", closeSheet);
menuButton.addEventListener("click", openMenu);
profileButton.addEventListener("click", openProfile);
closeInfoButton.addEventListener("click", closeInfoSheet);

sheet.addEventListener("click", (event) => {
  if (event.target === sheet) {
    closeSheet();
  }
});

infoSheet.addEventListener("click", (event) => {
  if (event.target === infoSheet) {
    closeInfoSheet();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !sheet.hidden) {
    closeSheet();
  }

  if (event.key === "Escape" && !infoSheet.hidden) {
    closeInfoSheet();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (formFields.start.value >= formFields.end.value) {
    form.classList.add("has-error");
    return;
  }

  form.classList.remove("has-error");

  if (editingEventId) {
    events = events.map((item) =>
      item.id === editingEventId
        ? {
            ...item,
            date: form.dataset.date,
            start: formFields.start.value,
            end: formFields.end.value,
            title: formFields.title.value.trim(),
            note: formFields.note.value.trim(),
          }
        : item,
    );
  } else {
    events = [
      ...events,
      {
        id: `evt-${Date.now()}`,
        date: form.dataset.date,
        start: formFields.start.value,
        end: formFields.end.value,
        title: formFields.title.value.trim(),
        note: formFields.note.value.trim(),
        category: activeFilter === "all" ? "work" : activeFilter,
      },
    ];
  }

  saveEvents();
  closeSheet();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openNavView(button.dataset.navView);
  });
});

prevMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  selectedDay = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1));
  render();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  selectedDay = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1));
  render();
});

todayButton.addEventListener("click", () => {
  visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDay = toDateKey(today);
  render();
});

render();
