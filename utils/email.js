// ============================================================
//  email.js  -  Optional email notifications via Nodemailer
//
//  If EMAIL_USER / EMAIL_PASS are set in .env, real emails are
//  sent (Gmail by default). If they are empty, the email content
//  is printed to the console instead, so the app keeps working
//  without any email setup.
// ============================================================

const nodemailer = require('nodemailer');

// Build a transporter only if credentials are provided
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Generic send function (falls back to console if not configured)
async function sendEmail(to, subject, text) {
  if (!transporter) {
    console.log('\n📧 [Email disabled - printed to console]');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ${text}\n`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('📧 Email error:', err.message);
  }
}

// ---------- Pre-built messages ----------

// Sent when an admin confirms a booking
function sendConfirmation(booking, roomName) {
  const subject = 'RoomFlow - Your booking is confirmed';
  const text =
    `Hello ${booking.customerName},\n\n` +
    `Your booking has been CONFIRMED.\n\n` +
    `Room: ${roomName}\nDate: ${booking.date}\n` +
    `Time: ${booking.startTime} - ${booking.endTime}\n` +
    `People: ${booking.numberOfPeople}\n` +
    `Booking reference: ${booking.qrToken}\n\n` +
    `Please show your QR code at the room entrance.\n\nThank you for using RoomFlow.`;
  return sendEmail(booking.email, subject, text);
}

// Sent when an admin cancels a booking
function sendCancellation(booking, roomName) {
  const subject = 'RoomFlow - Your booking was cancelled';
  const text =
    `Hello ${booking.customerName},\n\n` +
    `Your booking has been CANCELLED.\n\n` +
    `Room: ${roomName}\nDate: ${booking.date}\n` +
    `Time: ${booking.startTime} - ${booking.endTime}\n\n` +
    `If this is unexpected, please contact us.\n\nRoomFlow.`;
  return sendEmail(booking.email, subject, text);
}

// Sent to the first person in the waiting list when a slot frees up
function sendWaitlistOpening(entry, roomName) {
  const subject = 'RoomFlow - A slot you wanted is now available!';
  const text =
    `Hello ${entry.customerName},\n\n` +
    `Good news! A spot opened up for the time you wanted.\n\n` +
    `Room: ${roomName}\nDate: ${entry.date}\n` +
    `Time: ${entry.startTime} - ${entry.endTime}\n\n` +
    `Please visit RoomFlow to book it before someone else does.\n\nRoomFlow.`;
  return sendEmail(entry.email, subject, text);
}

module.exports = {
  sendEmail,
  sendConfirmation,
  sendCancellation,
  sendWaitlistOpening
};
