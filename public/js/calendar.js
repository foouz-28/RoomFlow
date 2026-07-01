// ============================================================
//  calendar.js  -  Availability calendar (public)
//  Shows each room as an hourly timeline (08:00 - 22:00) for a
//  chosen date, marking each hour as Free or Booked.
// ============================================================

const OPEN_HOUR = 8;   // 08:00
const CLOSE_HOUR = 22; // 22:00

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  setupLanguageSwitch();

  const dateInput = document.getElementById('calDate');
  // Default to today
  dateInput.value = new Date().toISOString().split('T')[0];

  document.getElementById('showBtn').addEventListener('click', loadCalendar);
  document.addEventListener('languageChanged', loadCalendar);
  loadCalendar();
});

function setupLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', toggleLanguage));
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function timeToMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

async function loadCalendar() {
  const date = document.getElementById('calDate').value;
  const container = document.getElementById('calendarContainer');
  if (!date) return;

  container.innerHTML = `<p class="text-center">${t('loading')}</p>`;

  try {
    const res = await fetch('/api/availability?date=' + date);
    const data = await res.json();

    if (!data.rooms || !data.rooms.length) {
      container.innerHTML = `<p class="text-center">${t('no_data')}</p>`;
      return;
    }

    container.innerHTML = data.rooms.map((room) => roomTimeline(room)).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-center">${t('no_data')}</p>`;
  }
}

function roomTimeline(room) {
  let slots = '';
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const slotStart = h * 60;
    const slotEnd = (h + 1) * 60;
    // Booked if any booking overlaps this hour block
    const booked = room.bookings.some((b) =>
      timeToMin(b.startTime) < slotEnd && timeToMin(b.endTime) > slotStart
    );
    const label = String(h).padStart(2, '0');
    slots += `<div class="slot ${booked ? 'booked' : ''}" title="${label}:00">${label}</div>`;
  }

  return `
    <div class="cal-room">
      <div class="cal-room-head">
        <h3>${roomName(room)} <small style="color:var(--muted);">(${room.size})</small></h3>
        <span style="font-size:0.85rem; color:var(--muted);">
          <span class="badge badge-available">${t('free')}</span>
          <span class="badge badge-unavailable">${t('busy')}</span>
        </span>
      </div>
      <div class="timeline">${slots}</div>
    </div>
  `;
}
