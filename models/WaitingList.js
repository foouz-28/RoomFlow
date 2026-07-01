// ============================================================
//  WaitingList Model
//  When a room is already booked for a requested time, the
//  customer can join a waiting list. If the conflicting booking
//  is later cancelled, the first person in the list is notified.
// ============================================================

const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },

  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },

  date: { type: String, required: true },        // "YYYY-MM-DD"
  startTime: { type: String, required: true },   // "HH:MM"
  endTime: { type: String, required: true },     // "HH:MM"
  numberOfPeople: { type: Number, required: true, min: 1 },
  notes: { type: String, default: '', trim: true },

  // Whether this person has already been notified that a slot opened
  notified: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('WaitingList', waitingListSchema);
