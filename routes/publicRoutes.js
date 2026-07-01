// ============================================================
//  Public Routes (no login required)
//   GET  /rooms                 - list active rooms
//   GET  /rooms/suggest         - auto-suggest the best room
//   GET  /rooms/:id             - single room
//   POST /bookings              - create booking (+ QR code)
//   POST /waitlist              - join the waiting list
//   GET  /verify/:token         - verify a booking by QR token
//   GET  /my-bookings           - booking history by email
//   GET  /availability          - rooms + bookings for a date (calendar)
// ============================================================

const express = require('express');
const router = express.Router();

const Room = require('../models/Room');
const Booking = require('../models/Booking');
const WaitingList = require('../models/WaitingList');
const {
  isValidEmail,
  timeToMinutes,
  hasConflict,
  generateToken,
  generateQRDataURL
} = require('../utils/helpers');

// ------------------------------------------------------------
//  GET /api/rooms  - all active rooms
// ------------------------------------------------------------
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ capacity: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching rooms.' });
  }
});

// ------------------------------------------------------------
//  GET /api/rooms/suggest?people=&date=&startTime=&endTime=
//  Suggest the BEST available room for the request:
//   - capacity must fit the number of people
//   - room must be free for the requested time
//   - "best fit" = smallest capacity that fits, then cheapest
//  (Must be defined BEFORE "/rooms/:id" to avoid route clash.)
// ------------------------------------------------------------
router.get('/rooms/suggest', async (req, res) => {
  try {
    const { people, date, startTime, endTime } = req.query;
    const need = Number(people);

    if (!need || need < 1 || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'people, date, startTime and endTime are required.' });
    }
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    // Rooms that can fit the group, smallest first (best fit), then cheapest
    const candidates = await Room.find({ isActive: true, capacity: { $gte: need } })
      .sort({ capacity: 1, pricePerHour: 1 });

    // Keep only rooms with no conflicting booking that day
    const available = [];
    for (const room of candidates) {
      const dayBookings = await Booking.find({
        roomId: room._id,
        date,
        status: { $ne: 'Cancelled' }
      });
      if (!hasConflict(dayBookings, startTime, endTime)) {
        available.push(room);
      }
    }

    if (!available.length) {
      return res.json({ suggestion: null, alternatives: [] });
    }

    res.json({ suggestion: available[0], alternatives: available.slice(1) });
  } catch (err) {
    res.status(500).json({ message: 'Server error while suggesting a room.' });
  }
});

// ------------------------------------------------------------
//  GET /api/rooms/:id  - single room
// ------------------------------------------------------------
router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: 'Invalid room id.' });
  }
});

// ------------------------------------------------------------
//  Shared validation for a booking/waitlist request.
//  Returns { ok:true, room, people } or { ok:false, status, message }.
// ------------------------------------------------------------
async function validateBookingInput(body) {
  const { customerName, phone, email, roomId, date, startTime, endTime, numberOfPeople } = body;

  if (!customerName || !customerName.trim()) return fail(400, 'Name is required.');
  if (!phone || !phone.trim()) return fail(400, 'Phone number is required.');
  if (!email || !isValidEmail(email)) return fail(400, 'A valid email is required.');
  if (!roomId) return fail(400, 'Please select a room.');
  if (!date || !startTime || !endTime) return fail(400, 'Date, start time and end time are required.');
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) return fail(400, 'End time must be after start time.');

  const room = await Room.findById(roomId).catch(() => null);
  if (!room) return fail(404, 'Selected room does not exist.');

  const people = Number(numberOfPeople);
  if (!people || people < 1) return fail(400, 'Number of people must be at least 1.');
  if (people > room.capacity) return fail(400, `Number of people exceeds room capacity (max ${room.capacity}).`);

  return { ok: true, room, people };

  function fail(status, message) { return { ok: false, status, message }; }
}

// ------------------------------------------------------------
//  POST /api/bookings  - create a booking with conflict check + QR
// ------------------------------------------------------------
router.post('/bookings', async (req, res) => {
  try {
    const check = await validateBookingInput(req.body);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const { roomId, date, startTime, endTime } = req.body;

    // Conflict check against all non-cancelled bookings for that room/date
    const existing = await Booking.find({ roomId, date, status: { $ne: 'Cancelled' } });
    if (hasConflict(existing, startTime, endTime)) {
      return res.status(409).json({
        message: 'This room is already booked during the selected time. You can join the waiting list.',
        conflict: true
      });
    }

    // Create the booking with a unique QR token
    const qrToken = generateToken();
    const booking = await Booking.create({
      customerName: req.body.customerName.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email.trim().toLowerCase(),
      roomId,
      date,
      startTime,
      endTime,
      numberOfPeople: check.people,
      notes: req.body.notes ? req.body.notes.trim() : '',
      paymentMethod: req.body.paymentMethod || 'Pay at venue',
      status: 'Pending',
      qrToken
    });

    // Build the QR image to return to the customer
    const qrDataUrl = await generateQRDataURL(qrToken);

    res.status(201).json({
      message: 'Booking created successfully! Your booking is pending confirmation.',
      booking,
      qrToken,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
});

// ------------------------------------------------------------
//  POST /api/waitlist  - join the waiting list for a busy slot
// ------------------------------------------------------------
router.post('/waitlist', async (req, res) => {
  try {
    const check = await validateBookingInput(req.body);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const entry = await WaitingList.create({
      customerName: req.body.customerName.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email.trim().toLowerCase(),
      roomId: req.body.roomId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      numberOfPeople: check.people,
      notes: req.body.notes ? req.body.notes.trim() : ''
    });

    res.status(201).json({
      message: 'You have been added to the waiting list. We will email you if a slot opens.',
      entry
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while joining the waiting list.' });
  }
});

// ------------------------------------------------------------
//  GET /api/verify/:token  - verify a booking from its QR code
// ------------------------------------------------------------
router.get('/verify/:token', async (req, res) => {
  try {
    const booking = await Booking.findOne({ qrToken: req.params.token })
      .populate('roomId', 'name nameEn nameAr size');
    if (!booking) {
      return res.status(404).json({ valid: false, message: 'Invalid or unknown booking code.' });
    }
    res.json({
      valid: true,
      booking: {
        id: booking._id,
        customerName: booking.customerName,
        room: booking.roomId ? booking.roomId.name : '-',
        roomEn: booking.roomId ? (booking.roomId.nameEn || booking.roomId.name) : '-',
        roomAr: booking.roomId ? (booking.roomId.nameAr || booking.roomId.name) : '-',
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfPeople: booking.numberOfPeople,
        status: booking.status,
        checkedIn: booking.checkedIn,
        qrToken: booking.qrToken
      }
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Server error during verification.' });
  }
});

// ------------------------------------------------------------
//  GET /api/my-bookings?email=  - booking history for a customer
// ------------------------------------------------------------
router.get('/my-bookings', async (req, res) => {
  try {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }
    const bookings = await Booking.find({ email })
      .populate('roomId', 'name nameEn nameAr size')
      .sort({ date: -1, startTime: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching your bookings.' });
  }
});

// ------------------------------------------------------------
//  GET /api/availability?date=YYYY-MM-DD
//  For the calendar: each active room with its bookings that day.
// ------------------------------------------------------------
router.get('/availability', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ message: 'date is required.' });

    const rooms = await Room.find({ isActive: true }).sort({ capacity: 1 });
    const result = [];

    for (const room of rooms) {
      const bookings = await Booking.find({
        roomId: room._id,
        date,
        status: { $ne: 'Cancelled' }
      }).sort({ startTime: 1 });

      result.push({
        roomId: room._id,
        name: room.name,
        nameEn: room.nameEn,
        nameAr: room.nameAr,
        size: room.size,
        capacity: room.capacity,
        bookings: bookings.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status
        }))
      });
    }

    res.json({ date, rooms: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching availability.' });
  }
});

module.exports = router;
