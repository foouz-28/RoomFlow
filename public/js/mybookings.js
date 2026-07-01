// ============================================================
//  mybookings.js  -  Customer booking history (public)
//  The customer enters their email and sees all their bookings
//  (no account needed). History is looked up by email.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  setupLanguageSwitch();
  document.getElementById('historyForm').addEventListener('submit', loadHistory);
});

function setupLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', toggleLanguage));
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function statusBadge(status) {
  const cls = status === 'Confirmed' ? 'badge-confirmed'
    : status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending';
  return `<span class="badge ${cls}">${t('status_' + status)}</span>`;
}

async function loadHistory(e) {
  e.preventDefault();
  const email = document.getElementById('historyEmail').value.trim();
  const result = document.getElementById('historyResult');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    result.innerHTML = `<div class="alert alert-error show">${t('label_email')}</div>`;
    return;
  }

  result.innerHTML = `<p class="text-center">${t('loading')}</p>`;

  try {
    const res = await fetch('/api/my-bookings?email=' + encodeURIComponent(email));
    const bookings = await res.json();

    if (!Array.isArray(bookings) || !bookings.length) {
      result.innerHTML = `<div class="alert alert-info show">${t('no_bookings')}</div>`;
      return;
    }

    result.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>${t('col_room')}</th>
              <th>${t('col_date')}</th>
              <th>${t('col_time')}</th>
              <th>${t('col_people')}</th>
              <th>${t('col_status')}</th>
              <th>${t('booking_ref')}</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map((b) => `
              <tr>
                <td>${b.roomId ? roomName(b.roomId) : '-'}</td>
                <td>${b.date}</td>
                <td>${b.startTime} - ${b.endTime}</td>
                <td>${b.numberOfPeople}</td>
                <td>${statusBadge(b.status)}</td>
                <td><small>${b.qrToken || '-'}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<div class="alert alert-error show">${t('no_data')}</div>`;
  }
}
