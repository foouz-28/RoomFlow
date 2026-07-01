// ============================================================
//  Admin / Staff Routes
//   - Login is public; everything else needs a valid token.
//   - Room & account management require the "Admin" role.
//   - Booking management is available to Admin and Staff.
// ============================================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const WaitingList = require('../models/WaitingList');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');
const { isValidEmail, rangesOverlap } = require('../utils/helpers');
const email = require('../utils/email');

// ------------------------------------------------------------
//  POST /api/admin/login   (PUBLIC)
// ------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email: loginEmail, password } = req.body;
    if (!loginEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const account = await Admin.findOne({ email: loginEmail.toLowerCase().trim() });
    if (!account || !(await account.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: account._id, email: account.email, role: account.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Login successful.', token, email: account.email, role: account.role, name: account.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ============================================================
//  All routes below require a valid token.
// ============================================================
router.use(authMiddleware);

// Return the logged-in account (used to verify token + role on the client)
router.get('/me', (req, res) => {
  res.json({ email: req.admin.email, role: req.admin.role });
});

// ============================================================
//  ACCOUNT MANAGEMENT (Admin only)
// ============================================================

// List all accounts
router.get('/accounts', requireAdmin, async (req, res) => {
  try {
    const accounts = await Admin.find().select('-password').sort({ createdAt: 1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching accounts.' });
  }
});

// Create a new account (Admin or Staff)
router.post('/create', requireAdmin, async (req, res) => {
  try {
    const { name, email: newEmail, password, role } = req.body;
    if (!newEmail || !isValidEmail(newEmail)) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const finalRole = role === 'Staff' ? 'Staff' : 'Admin';

    const exists = await Admin.findOne({ email: newEmail.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

    const account = await Admin.create({
      name: name || '',
      email: newEmail.toLowerCase().trim(),
      password,
      role: finalRole
    });
    res.status(201).json({ message: `New ${finalRole} account created.`, email: account.email, role: account.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error while creating account.' });
  }
});

// Delete an account (cannot delete yourself)
router.delete('/accounts/:id', requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const account = await Admin.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    res.json({ message: 'Account deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting account.' });
  }
});

// ============================================================
//  ROOMS MANAGEMENT (Admin only)
// ============================================================
function parseFacilities(facilities) {
  if (Array.isArray(facilities)) return facilities;
  if (facilities) return String(facilities).split(',').map((f) => f.trim()).filter(Boolean);
  return [];
}

router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching rooms.' });
  }
});

router.post('/rooms', requireAdmin, async (req, res) => {
  try {
    const { name, nameEn, nameAr, size, capacity, pricePerHour, description, facilities, image, isActive } = req.body;
    const finalName = nameEn || nameAr || name;
    if (!finalName || !size || !capacity || pricePerHour === undefined) {
      return res.status(400).json({ message: 'Name, size, capacity and price are required.' });
    }
    const room = await Room.create({
      name: finalName,
      nameEn: nameEn || finalName,
      nameAr: nameAr || '',
      size, capacity, pricePerHour,
      description: description || '',
      facilities: parseFacilities(facilities),
      image: image || '',
      isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json({ message: 'Room added successfully.', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error while adding room.' });
  }
});

router.put('/rooms/:id', requireAdmin, async (req, res) => {
  try {
    const { name, nameEn, nameAr, size, capacity, pricePerHour, description, facilities, image, isActive } = req.body;
    const finalName = nameEn || nameAr || name;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        name: finalName,
        nameEn: nameEn || finalName,
        nameAr: nameAr || '',
        size, capacity, pricePerHour,
        description: description || '',
        facilities: parseFacilities(facilities),
        image: image || '',
        isActive
      },
      { new: true, runValidators: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room updated successfully.', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating room.' });
  }
});

router.delete('/rooms/:id', requireAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting room.' });
  }
});

// ============================================================
//  BOOKINGS MANAGEMENT (Admin + Staff)
// ============================================================
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomId', 'name nameEn nameAr size')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
});

// Change status. Cancelling triggers email + notifies the waiting list.
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const booking = await Booking.findById(req.params.id).populate('roomId', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const wasNotCancelled = booking.status !== 'Cancelled';
    booking.status = status;
    await booking.save();

    const roomName = booking.roomId ? booking.roomId.name : 'Room';

    // Send the customer an email about the change
    if (status === 'Confirmed') email.sendConfirmation(booking, roomName);
    if (status === 'Cancelled' && wasNotCancelled) {
      email.sendCancellation(booking, roomName);
      // Notify the first waiting-list person whose slot now opened
      await notifyWaitingList(booking);
    }

    res.json({ message: 'Booking status updated.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating booking.' });
  }
});

// Mark a booking as checked-in (used by the QR verify page)
router.patch('/bookings/:id/checkin', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { checkedIn: true }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Checked in.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error during check-in.' });
  }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting booking.' });
  }
});

// Helper: when a booking is cancelled, find the earliest waiting person
// whose requested time overlapped the freed slot and notify them.
async function notifyWaitingList(cancelled) {
  const waiting = await WaitingList.find({
    roomId: cancelled.roomId,
    date: cancelled.date,
    notified: false
  }).populate('roomId', 'name').sort({ createdAt: 1 });

  const match = waiting.find((w) =>
    rangesOverlap(w.startTime, w.endTime, cancelled.startTime, cancelled.endTime)
  );

  if (match) {
    match.notified = true;
    await match.save();
    email.sendWaitlistOpening(match, match.roomId ? match.roomId.name : 'Room');
  }
}

// ============================================================
//  WAITING LIST (Admin + Staff)
// ============================================================
router.get('/waitlist', async (req, res) => {
  try {
    const list = await WaitingList.find()
      .populate('roomId', 'name nameEn nameAr')
      .sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching the waiting list.' });
  }
});

router.delete('/waitlist/:id', async (req, res) => {
  try {
    const entry = await WaitingList.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });
    res.json({ message: 'Waiting-list entry removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while removing entry.' });
  }
});

// ============================================================
//  DASHBOARD STATISTICS + CHART DATA (Admin + Staff)
// ============================================================
router.get('/stats', async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const waitingCount = await WaitingList.countDocuments();

    // ----- Most used rooms (top 5 by number of bookings) -----
    const mostUsed = await Booking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
      { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$room.name', count: 1, _id: 0 } }
    ]);

    // ----- Peak hours (count bookings by start hour) -----
    const peakAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: { $substr: ['$startTime', 0, 2] }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const peakHours = peakAgg.map((p) => ({ hour: `${p._id}:00`, count: p.count }));

    // ----- Monthly bookings (by year-month of the booking date) -----
    const monthAgg = await Booking.aggregate([
      { $group: { _id: { $substr: ['$date', 0, 7] }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);
    const monthlyBookings = monthAgg.map((m) => ({ month: m._id, count: m.count }));

    res.json({
      totalRooms, totalBookings, confirmedBookings, cancelledBookings, pendingBookings, waitingCount,
      mostUsed, peakHours, monthlyBookings
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
});

module.exports = router;
