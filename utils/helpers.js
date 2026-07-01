// ============================================================
//  helpers.js  -  Shared backend helper functions
//   - Time conversion & overlap detection
//   - Conflict checking against existing bookings
//   - Unique QR token generation + QR image (data URL)
// ============================================================

const crypto = require('crypto');
const QRCode = require('qrcode');

// Validate an email address format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Convert "HH:MM" to total minutes (for easy comparison)
function timeToMinutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + m;
}

// Do two time ranges overlap? (touching edges do NOT count as overlap)
function rangesOverlap(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) &&
         timeToMinutes(endA) > timeToMinutes(startB);
}

// Given a list of bookings, does the new range conflict with any of them?
function hasConflict(bookings, startTime, endTime) {
  return bookings.some((b) => rangesOverlap(b.startTime, b.endTime, startTime, endTime));
}

// Generate a short, unique, hard-to-guess token for a booking QR code
function generateToken() {
  return crypto.randomBytes(8).toString('hex').toUpperCase(); // 16 chars
}

// Generate a QR code image (PNG data URL) that points to the verify page
async function generateQRDataURL(token) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/verify.html?token=${token}`;
  return QRCode.toDataURL(verifyUrl, { width: 240, margin: 1 });
}

module.exports = {
  isValidEmail,
  timeToMinutes,
  rangesOverlap,
  hasConflict,
  generateToken,
  generateQRDataURL
};
