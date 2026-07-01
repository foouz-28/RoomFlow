// ============================================================
//  verify.js  -  QR booking verification page
//  Opened when a QR code is scanned (?token=XXXX) or used by
//  staff to type a booking reference manually.
//  Anyone can VIEW the result; only logged-in staff/admin see
//  the "Mark as Checked-in" button.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', toggleLanguage));

  document.getElementById('verifyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    verify(document.getElementById('tokenInput').value.trim());
  });

  // Auto-verify if a token is present in the URL (QR scan)
  const token = new URLSearchParams(location.search).get('token');
  if (token) {
    document.getElementById('tokenInput').value = token;
    verify(token);
  }
});

function statusBadge(status) {
  const cls = status === 'Confirmed' ? 'badge-confirmed'
    : status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending';
  return `<span class="badge ${cls}">${t('status_' + status)}</span>`;
}

async function verify(token) {
  const result = document.getElementById('verifyResult');
  if (!token) return;
  result.innerHTML = `<p>${t('loading')}</p>`;

  try {
    const res = await fetch('/api/verify/' + encodeURIComponent(token));
    const data = await res.json();

    if (!data.valid) {
      result.innerHTML = `<div class="verify-status bad">✕ ${t('verify_invalid')}</div><p>${data.message || ''}</p>`;
      return;
    }

    const b = data.booking;
    const isStaff = !!localStorage.getItem('admin_token');

    result.innerHTML = `
      <div class="verify-status ok">✓ ${t('verify_valid')}</div>
      <div class="verify-detail">
        <div><span>${t('label_name')}</span><strong>${b.customerName}</strong></div>
        <div><span>${t('col_room')}</span><strong>${getLang() === 'ar' ? (b.roomAr || b.room) : (b.roomEn || b.room)}</strong></div>
        <div><span>${t('col_date')}</span><strong>${b.date}</strong></div>
        <div><span>${t('col_time')}</span><strong>${b.startTime} - ${b.endTime}</strong></div>
        <div><span>${t('col_people')}</span><strong>${b.numberOfPeople}</strong></div>
        <div><span>${t('col_status')}</span><strong>${statusBadge(b.status)}</strong></div>
        <div><span>${t('col_checkin')}</span><strong>${b.checkedIn ? t('checked_in') : t('not_checked')}</strong></div>
      </div>
      ${isStaff && !b.checkedIn
        ? `<button class="btn btn-success btn-block" id="checkinBtn" data-id="${b.id}">${t('mark_checkin')}</button>`
        : ''}
    `;

    const btn = document.getElementById('checkinBtn');
    if (btn) btn.addEventListener('click', () => checkIn(b.id, token));
  } catch (err) {
    result.innerHTML = `<div class="verify-status bad">✕ ${t('verify_invalid')}</div>`;
  }
}

async function checkIn(id, token) {
  try {
    const res = await fetch('/api/admin/bookings/' + id + '/checkin', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') }
    });
    if (res.ok) verify(token); // refresh
    else alert(t('staff_no_access'));
  } catch (err) {
    alert(t('no_data'));
  }
}
