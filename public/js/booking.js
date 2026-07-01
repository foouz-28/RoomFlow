// ============================================================
//  booking.js  -  Public booking form
//   - Loads rooms into the dropdown (+ preselect from URL)
//   - "Suggest best room" by people + date + time
//   - Validates input, submits, and shows the QR code
//   - Offers the waiting list when the room is busy
// ============================================================

let roomsCache = [];
let lastConflictData = null; // remembers the request if it conflicts

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const roomSelect = document.getElementById('roomId');
  loadRoomOptions(roomSelect);
  document.addEventListener('languageChanged', () => loadRoomOptions(roomSelect));

  form.addEventListener('submit', submitBooking);
  document.getElementById('suggestBtn').addEventListener('click', suggestRoom);
  document.getElementById('newBookingBtn').addEventListener('click', resetForm);
});

// ---------- Load rooms into the dropdown ----------
async function loadRoomOptions(select) {
  try {
    const res = await fetch('/api/rooms');
    roomsCache = await res.json();
    const preselect = new URLSearchParams(location.search).get('room');

    select.innerHTML =
      `<option value="">${t('choose_room')}</option>` +
      roomsCache.map((r) =>
        `<option value="${r._id}" ${r._id === preselect ? 'selected' : ''}>
           ${roomName(r)} - ${r.size} (${t('capacity_label')}: ${r.capacity})
         </option>`
      ).join('');
  } catch (err) {
    select.innerHTML = `<option value="">${t('no_data')}</option>`;
  }
}

// ---------- Read all form values ----------
function readForm() {
  return {
    customerName: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    roomId: document.getElementById('roomId').value,
    date: document.getElementById('date').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    numberOfPeople: document.getElementById('numberOfPeople').value,
    notes: document.getElementById('notes').value.trim(),
    paymentMethod: document.getElementById('paymentMethod').value
  };
}

// ---------- Alert helper ----------
function showAlert(type, message) {
  const box = document.getElementById('alertBox');
  box.className = `alert alert-${type} show`;
  box.textContent = message;
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideAlert() {
  document.getElementById('alertBox').className = 'alert';
}

// ============================================================
//  Suggest the best available room
// ============================================================
async function suggestRoom() {
  const d = readForm();
  hideWaitlist();
  if (!d.numberOfPeople || !d.date || !d.startTime || !d.endTime) {
    return showAlert('error', t('suggest_fill_first'));
  }
  if (d.endTime <= d.startTime) {
    return showAlert('error', t('label_end') + ' > ' + t('label_start'));
  }

  const params = new URLSearchParams({
    people: d.numberOfPeople, date: d.date, startTime: d.startTime, endTime: d.endTime
  });

  try {
    const res = await fetch('/api/rooms/suggest?' + params.toString());
    const data = await res.json();
    const box = document.getElementById('suggestBox');

    if (!data.suggestion) {
      box.className = 'suggest-box';
      box.innerHTML = `<h4>${t('suggest_heading')}</h4><p>${t('suggest_none')}</p>`;
      box.style.display = 'block';
      return;
    }

    const s = data.suggestion;
    box.className = 'suggest-box';
    box.innerHTML = `
      <h4>${t('suggest_heading')}</h4>
      <p><strong>${roomName(s)}</strong> - ${s.size} · ${t('capacity_label')}: ${s.capacity} · ${s.pricePerHour} ${t('kwd')} ${t('per_hour')}</p>
      <button type="button" class="btn btn-primary btn-sm mt-2" id="useSuggestionBtn">${t('use_this_room')}</button>
    `;
    box.style.display = 'block';
    document.getElementById('useSuggestionBtn').addEventListener('click', () => {
      document.getElementById('roomId').value = s._id;
      hideAlert();
    });
  } catch (err) {
    showAlert('error', t('no_data'));
  }
}

// ============================================================
//  Submit the booking
// ============================================================
async function submitBooking(e) {
  e.preventDefault();
  hideWaitlist();
  const d = readForm();

  // Client-side validation
  if (!d.customerName) return showAlert('error', t('label_name'));
  if (!d.phone) return showAlert('error', t('label_phone'));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return showAlert('error', t('label_email'));
  if (!d.roomId) return showAlert('error', t('label_room'));
  if (!d.date || !d.startTime || !d.endTime) return showAlert('error', t('label_date'));
  if (d.endTime <= d.startTime) return showAlert('error', t('label_end') + ' > ' + t('label_start'));

  const room = roomsCache.find((r) => r._id === d.roomId);
  const people = Number(d.numberOfPeople);
  if (!people || people < 1) return showAlert('error', t('label_people'));
  if (room && people > room.capacity) {
    return showAlert('error', `${t('label_people')} > ${t('capacity_label')} (${room.capacity})`);
  }

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    const result = await res.json();

    if (res.ok) {
      showQR(result);
    } else if (result.conflict) {
      // Room busy -> offer the waiting list
      lastConflictData = d;
      showWaitlistOffer(result.message);
    } else {
      showAlert('error', result.message);
    }
  } catch (err) {
    showAlert('error', 'Network error. Please try again.');
  }
}

// ============================================================
//  Show the QR code result (replaces the form)
// ============================================================
function showQR(result) {
  document.getElementById('bookingForm').style.display = 'none';
  document.getElementById('suggestBox').style.display = 'none';
  hideAlert();
  hideWaitlist();

  const box = document.getElementById('resultBox');
  box.innerHTML = `
    <div class="qr-result">
      <h3 style="color:var(--green);">${t('booking_success_title')}</h3>
      <p class="mt-2">${t('qr_hint')}</p>
      <img src="${result.qrDataUrl}" alt="QR code" width="220" height="220" />
      <p>${t('booking_ref')}:</p>
      <p class="qr-ref">${result.qrToken}</p>
      <div class="mt-2" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <a class="btn btn-ghost" href="${result.qrDataUrl}" download="roomflow-${result.qrToken}.png">${t('download_qr')}</a>
        <button class="btn btn-primary" id="newBookingBtn2">${t('new_booking')}</button>
      </div>
    </div>
  `;
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('newBookingBtn2').addEventListener('click', resetForm);
}

// ============================================================
//  Waiting list offer + join
// ============================================================
function showWaitlistOffer(message) {
  const box = document.getElementById('waitlistBox');
  box.className = 'suggest-box';
  box.innerHTML = `
    <h4>${t('conflict_title')}</h4>
    <p>${message}</p>
    <button type="button" class="btn btn-warning btn-sm mt-2" id="joinWaitlistBtn">${t('join_waitlist')}</button>
  `;
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('joinWaitlistBtn').addEventListener('click', joinWaitlist);
}

function hideWaitlist() {
  const box = document.getElementById('waitlistBox');
  if (box) box.style.display = 'none';
}

async function joinWaitlist() {
  if (!lastConflictData) return;
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lastConflictData)
    });
    const result = await res.json();
    if (res.ok) {
      hideWaitlist();
      showAlert('success', t('waitlist_added'));
    } else {
      showAlert('error', result.message);
    }
  } catch (err) {
    showAlert('error', 'Network error. Please try again.');
  }
}

// ---------- Reset to a fresh form ----------
function resetForm() {
  document.getElementById('resultBox').style.display = 'none';
  document.getElementById('bookingForm').reset();
  document.getElementById('bookingForm').style.display = 'block';
  hideAlert();
  hideWaitlist();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
