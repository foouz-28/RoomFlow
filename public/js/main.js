// ============================================================
//  main.js  -  Shared logic for public pages
//   - Initializes language on load
//   - Wires up the language switch + mobile menu
//   - Loads room cards on the Home and Rooms pages
// ============================================================

// Run once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();          // from i18n.js
  setupLanguageSwitch();
  setupMobileMenu();
  highlightActiveLink();

  // If this page has a rooms container, load rooms into it
  const roomsContainer = document.getElementById('roomsContainer');
  if (roomsContainer) {
    loadRooms(roomsContainer);
    // Reload rooms when language changes (to translate labels)
    document.addEventListener('languageChanged', () => loadRooms(roomsContainer));
  }
});

// ------------------------------------------------------------
//  Language switch buttons
// ------------------------------------------------------------
function setupLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', toggleLanguage);
  });
}

// ------------------------------------------------------------
//  Mobile hamburger menu
// ------------------------------------------------------------
function setupMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// ------------------------------------------------------------
//  Highlight the current page in the navbar
// ------------------------------------------------------------
function highlightActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === page) a.classList.add('active');
  });
}

// ------------------------------------------------------------
//  Fetch rooms from the API and render them as cards.
// ------------------------------------------------------------
async function loadRooms(container) {
  container.innerHTML = `<p class="text-center">${t('loading')}</p>`;
  try {
    const res = await fetch('/api/rooms');
    const rooms = await res.json();

    if (!rooms.length) {
      container.innerHTML = `<p class="text-center">${t('no_data')}</p>`;
      return;
    }

    container.innerHTML = rooms.map((room) => roomCardHTML(room)).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-center">${t('no_data')}</p>`;
  }
}

// ------------------------------------------------------------
//  Build the HTML for a single room card.
// ------------------------------------------------------------
function roomCardHTML(room) {
  const facilities = (room.facilities || [])
    .map((f) => `<span class="facility-tag">${f}</span>`)
    .join('');

  // Localized room name (English / Arabic)
  const displayName = roomName(room);

  // Use the image if provided, otherwise show the room's initial letter.
  // If the image fails to load, fall back to the initial letter too.
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();
  const imageBlock = room.image
    ? `<img class="room-image" src="${room.image}" alt="${displayName}" style="object-fit:cover;"
         onerror="this.outerHTML='<div class=\\'room-image\\'>${initial}</div>'">`
    : `<div class="room-image">${initial}</div>`;

  const availBadge = room.isActive
    ? `<span class="badge badge-available">${t('available')}</span>`
    : `<span class="badge badge-unavailable">${t('unavailable')}</span>`;

  return `
    <div class="room-card">
      ${imageBlock}
      <div class="room-body">
        <div class="room-head">
          <h3>${displayName}</h3>
          ${availBadge}
        </div>
        <div class="room-size">${room.size}</div>
        <div class="room-meta">
          <span>${t('capacity_label')}: ${room.capacity} ${t('people_label')}</span>
        </div>
        <p class="room-desc">${room.description || ''}</p>
        <div class="facilities">${facilities}</div>
        <div class="price">${room.pricePerHour} ${t('kwd')} <small>${t('per_hour')}</small></div>
        <a class="btn btn-primary" href="booking.html?room=${room._id}">${t('book_this_room')}</a>
      </div>
    </div>
  `;
}
