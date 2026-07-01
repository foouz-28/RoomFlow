// ============================================================
//  admin.js  -  Logic for all admin / staff pages
//   - Login, logout, JWT handling, route guard
//   - Role awareness (Admin vs Staff): Staff cannot manage
//     rooms or accounts; those nav items + actions are hidden.
//   - Dashboard stats + CSS charts
//   - Manage rooms / bookings / waiting list / accounts
// ============================================================

const TOKEN_KEY = 'admin_token';
const ROLE_KEY = 'admin_role';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getRole() { return localStorage.getItem(ROLE_KEY) || 'Staff'; }
function setSession(token, role) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(ROLE_KEY, role); }
function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(ROLE_KEY); }

// ---------- Authenticated fetch ----------
async function apiFetch(url, options = {}) {
  const opts = { ...options };
  opts.headers = { ...(opts.headers || {}), 'Authorization': 'Bearer ' + getToken() };
  if (opts.body && !opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
  const res = await fetch(url, opts);
  if (res.status === 401) { clearSession(); location.href = 'admin-login.html'; return null; }
  return res;
}

function requireAuth() {
  if (!getToken()) { location.href = 'admin-login.html'; return false; }
  return true;
}

// ---------- Page dispatch ----------
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  setupLanguageSwitch();
  setupLogout();
  setupMenu();
  applyRoleUI();

  const page = document.body.getAttribute('data-page');
  switch (page) {
    case 'login': initLogin(); break;
    case 'dashboard': if (requireAuth()) initDashboard(); break;
    case 'manage-rooms': if (requireAuth()) initManageRooms(); break;
    case 'manage-bookings': if (requireAuth()) initManageBookings(); break;
    case 'waitlist': if (requireAuth()) initWaitlist(); break;
    case 'manage-accounts': if (requireAuth()) initAccounts(); break;
  }
});

function setupLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', toggleLanguage));
  document.addEventListener('languageChanged', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'dashboard') initDashboard();
    if (page === 'manage-rooms') loadRoomsTable();
    if (page === 'manage-bookings') loadBookingsTable();
    if (page === 'waitlist') loadWaitlist();
    if (page === 'manage-accounts') loadAccounts();
  });
}

function setupLogout() {
  document.querySelectorAll('.logout-btn').forEach((b) =>
    b.addEventListener('click', (e) => { e.preventDefault(); clearSession(); location.href = 'admin-login.html'; })
  );
}

function setupMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.admin-nav');
  if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));
}

// Hide Admin-only nav items when the logged-in user is Staff
function applyRoleUI() {
  if (getRole() !== 'Admin') {
    document.querySelectorAll('.admin-only').forEach((el) => el.classList.add('hidden'));
  }
}

function showAlert(type, message) {
  const box = document.getElementById('alertBox');
  if (!box) return alert(message);
  box.className = `alert alert-${type} show`;
  box.textContent = message;
}

function statusBadge(status) {
  const cls = status === 'Confirmed' ? 'badge-confirmed'
    : status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending';
  return `<span class="badge ${cls}">${t('status_' + status)}</span>`;
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

// ============================================================
//  LOGIN
// ============================================================
function initLogin() {
  if (getToken()) { location.href = 'admin-dashboard.html'; return; }
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) { setSession(data.token, data.role); location.href = 'admin-dashboard.html'; }
      else showAlert('error', data.message);
    } catch (err) {
      showAlert('error', 'Network error. Please try again.');
    }
  });
}

// ============================================================
//  DASHBOARD (stats + charts)
// ============================================================
async function initDashboard() {
  const res = await apiFetch('/api/admin/stats');
  if (!res) return;
  const s = await res.json();

  setText('statTotalRooms', s.totalRooms);
  setText('statTotalBookings', s.totalBookings);
  setText('statConfirmed', s.confirmedBookings);
  setText('statCancelled', s.cancelledBookings);
  setText('statPending', s.pendingBookings);
  setText('statWaiting', s.waitingCount);

  renderBarChart('chartMostUsed', s.mostUsed.map((r) => ({ label: r.name || '-', value: r.count })));
  renderBarChart('chartPeak', s.peakHours.map((p) => ({ label: p.hour, value: p.count })));
  renderBarChart('chartMonthly', s.monthlyBookings.map((m) => ({ label: m.month, value: m.count })));

  // Recent bookings
  const bRes = await apiFetch('/api/admin/bookings');
  if (!bRes) return;
  const bookings = await bRes.json();
  const tbody = document.getElementById('recentBookingsBody');
  if (tbody) {
    const recent = bookings.slice(0, 5);
    tbody.innerHTML = recent.length
      ? recent.map((b) => `
        <tr>
          <td>${b.customerName}</td>
          <td>${b.roomId ? roomName(b.roomId) : '-'}</td>
          <td>${b.date}</td>
          <td>${b.startTime} - ${b.endTime}</td>
          <td>${statusBadge(b.status)}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="text-center">${t('no_data')}</td></tr>`;
  }
}

// Render a simple CSS bar chart into a container
function renderBarChart(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!data.length) { el.innerHTML = `<div class="chart-empty">${t('no_data')}</div>`; return; }
  const max = Math.max(...data.map((d) => d.value), 1);
  el.innerHTML = data.map((d) => `
    <div class="bar-row">
      <div class="bar-label">${d.label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(d.value / max) * 100}%"></div></div>
      <div class="bar-value">${d.value}</div>
    </div>
  `).join('');
}

// ============================================================
//  MANAGE ROOMS (Admin only)
// ============================================================
let editingRoomId = null;

function initManageRooms() {
  if (getRole() !== 'Admin') { document.querySelector('main .container').innerHTML = `<div class="alert alert-error show">${t('staff_no_access')}</div>`; return; }
  loadRoomsTable();
  document.getElementById('addRoomBtn').addEventListener('click', openRoomModal);
  document.getElementById('roomForm').addEventListener('submit', saveRoom);
  document.getElementById('closeRoomModal').addEventListener('click', closeRoomModal);
  document.getElementById('cancelRoomBtn').addEventListener('click', closeRoomModal);
}

async function loadRoomsTable() {
  const res = await apiFetch('/api/admin/rooms');
  if (!res) return;
  const rooms = await res.json();
  const tbody = document.getElementById('roomsTableBody');
  if (!rooms.length) { tbody.innerHTML = `<tr><td colspan="7" class="text-center">${t('no_data')}</td></tr>`; return; }

  tbody.innerHTML = rooms.map((r) => `
    <tr>
      <td>${roomName(r)}</td>
      <td>${r.size}</td>
      <td>${r.capacity}</td>
      <td>${r.pricePerHour} ${t('kwd')}</td>
      <td>${(r.facilities || []).join(', ')}</td>
      <td>${r.isActive
        ? `<span class="badge badge-available">${t('available')}</span>`
        : `<span class="badge badge-unavailable">${t('unavailable')}</span>`}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-warning" onclick='editRoom(${JSON.stringify(r)})'>${t('edit')}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRoom('${r._id}')">${t('delete')}</button>
        </div>
      </td>
    </tr>`).join('');
}

function openRoomModal() {
  editingRoomId = null;
  document.getElementById('roomForm').reset();
  document.getElementById('roomModalTitle').textContent = t('add_room_title');
  document.getElementById('roomActive').checked = true;
  document.getElementById('roomModal').classList.add('show');
}
function closeRoomModal() { document.getElementById('roomModal').classList.remove('show'); }

function editRoom(room) {
  editingRoomId = room._id;
  document.getElementById('roomModalTitle').textContent = t('edit_room_title');
  document.getElementById('roomNameEn').value = room.nameEn || room.name || '';
  document.getElementById('roomNameAr').value = room.nameAr || '';
  document.getElementById('roomSize').value = room.size;
  document.getElementById('roomCapacity').value = room.capacity;
  document.getElementById('roomPrice').value = room.pricePerHour;
  document.getElementById('roomDescription').value = room.description || '';
  document.getElementById('roomFacilities').value = (room.facilities || []).join(', ');
  document.getElementById('roomImage').value = room.image || '';
  document.getElementById('roomActive').checked = room.isActive;
  document.getElementById('roomModal').classList.add('show');
}

async function saveRoom(e) {
  e.preventDefault();
  const nameEn = document.getElementById('roomNameEn').value.trim();
  const nameAr = document.getElementById('roomNameAr').value.trim();
  const body = {
    nameEn,
    nameAr,
    name: nameEn || nameAr, // legacy/fallback name
    size: document.getElementById('roomSize').value.trim(),
    capacity: Number(document.getElementById('roomCapacity').value),
    pricePerHour: Number(document.getElementById('roomPrice').value),
    description: document.getElementById('roomDescription').value.trim(),
    facilities: document.getElementById('roomFacilities').value,
    image: document.getElementById('roomImage').value.trim(),
    isActive: document.getElementById('roomActive').checked
  };
  const url = editingRoomId ? `/api/admin/rooms/${editingRoomId}` : '/api/admin/rooms';
  const res = await apiFetch(url, { method: editingRoomId ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (res.ok) { closeRoomModal(); loadRoomsTable(); } else alert(data.message);
}

async function deleteRoom(id) {
  if (!confirm(t('confirm_delete_room'))) return;
  const res = await apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' });
  if (res) loadRoomsTable();
}

// ============================================================
//  MANAGE BOOKINGS (Admin + Staff)
// ============================================================
function initManageBookings() { loadBookingsTable(); }

async function loadBookingsTable() {
  const res = await apiFetch('/api/admin/bookings');
  if (!res) return;
  const bookings = await res.json();
  const tbody = document.getElementById('bookingsTableBody');
  if (!bookings.length) { tbody.innerHTML = `<tr><td colspan="8" class="text-center">${t('no_data')}</td></tr>`; return; }

  tbody.innerHTML = bookings.map((b) => `
    <tr>
      <td>${b.customerName}</td>
      <td>${b.email}<br><small>${b.phone}</small></td>
      <td>${b.roomId ? roomName(b.roomId) : '-'}</td>
      <td>${b.date}<br><small>${b.startTime} - ${b.endTime}</small></td>
      <td>${b.numberOfPeople}</td>
      <td>${b.checkedIn ? `<span class="badge badge-confirmed">${t('checked_in')}</span>` : `<span class="badge badge-pending">${t('not_checked')}</span>`}</td>
      <td>
        <select class="form-control btn-sm" style="width:auto; padding:5px;" onchange="changeStatus('${b._id}', this.value)">
          <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>${t('status_Pending')}</option>
          <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>${t('status_Confirmed')}</option>
          <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>${t('status_Cancelled')}</option>
        </select>
      </td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteBooking('${b._id}')">${t('delete')}</button></td>
    </tr>`).join('');
}

async function changeStatus(id, status) {
  const res = await apiFetch(`/api/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  if (res) loadBookingsTable();
}
async function deleteBooking(id) {
  if (!confirm(t('confirm_delete_booking'))) return;
  const res = await apiFetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
  if (res) loadBookingsTable();
}

// ============================================================
//  WAITING LIST (Admin + Staff)
// ============================================================
function initWaitlist() { loadWaitlist(); }

async function loadWaitlist() {
  const res = await apiFetch('/api/admin/waitlist');
  if (!res) return;
  const list = await res.json();
  const tbody = document.getElementById('waitlistTableBody');
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="6" class="text-center">${t('no_data')}</td></tr>`; return; }

  tbody.innerHTML = list.map((w) => `
    <tr>
      <td>${w.customerName}</td>
      <td>${w.email}<br><small>${w.phone}</small></td>
      <td>${w.roomId ? roomName(w.roomId) : '-'}</td>
      <td>${w.date}<br><small>${w.startTime} - ${w.endTime}</small></td>
      <td>${w.notified ? `<span class="badge badge-confirmed">${t('yes')}</span>` : `<span class="badge badge-pending">${t('no')}</span>`}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteWaitlist('${w._id}')">${t('delete')}</button></td>
    </tr>`).join('');
}

async function deleteWaitlist(id) {
  if (!confirm(t('confirm_delete_entry'))) return;
  const res = await apiFetch(`/api/admin/waitlist/${id}`, { method: 'DELETE' });
  if (res) loadWaitlist();
}

// ============================================================
//  MANAGE ACCOUNTS (Admin only)
// ============================================================
function initAccounts() {
  if (getRole() !== 'Admin') { document.querySelector('main .container').innerHTML = `<div class="alert alert-error show">${t('staff_no_access')}</div>`; return; }
  loadAccounts();
  document.getElementById('createAccountForm').addEventListener('submit', createAccount);
}

async function loadAccounts() {
  const res = await apiFetch('/api/admin/accounts');
  if (!res) return;
  const accounts = await res.json();
  const tbody = document.getElementById('accountsTableBody');
  if (!accounts.length) { tbody.innerHTML = `<tr><td colspan="4" class="text-center">${t('no_data')}</td></tr>`; return; }

  tbody.innerHTML = accounts.map((a) => `
    <tr>
      <td>${a.name || '-'}</td>
      <td>${a.email}</td>
      <td><span class="badge badge-role-${a.role}">${t('role_' + a.role.toLowerCase())}</span></td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteAccount('${a._id}')">${t('delete')}</button></td>
    </tr>`).join('');
}

async function createAccount(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById('newName').value.trim(),
    email: document.getElementById('newEmail').value.trim(),
    password: document.getElementById('newPassword').value,
    role: document.getElementById('newRole').value
  };
  const res = await apiFetch('/api/admin/create', { method: 'POST', body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (res.ok) { showAlert('success', data.message); document.getElementById('createAccountForm').reset(); loadAccounts(); }
  else showAlert('error', data.message);
}

async function deleteAccount(id) {
  if (!confirm(t('confirm_delete_account'))) return;
  const res = await apiFetch(`/api/admin/accounts/${id}`, { method: 'DELETE' });
  if (!res) return;
  const data = await res.json();
  if (res.ok) loadAccounts(); else alert(data.message);
}
