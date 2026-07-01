// ============================================================
//  Booking Model
//  Represents a customer's booking for a specific room,
//  date and time range.
// ============================================================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Customer full name
  customerName: {
    type: String,
    required: true,
    trim: true
  },

  // Customer phone number
  phone: {
    type: String,
    required: true,
    trim: true
  },

  // Customer email address
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },

  // Reference to the booked room
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },

  // Booking date, stored as "YYYY-MM-DD" string for easy comparison
  date: {
    type: String,
    required: true
  },

  // Start time in 24-hour "HH:MM" format
  startTime: {
    type: String,
    required: true
  },

  // End time in 24-hour "HH:MM" format
  endTime: {
    type: String,
    required: true
  },

  // Number of people attending
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1
  },

  // Optional notes from the customer
  notes: {
    type: String,
    default: '',
    trim: true
  },

  // Chosen payment method (display only - payment is not processed)
  paymentMethod: {
    type: String,
    default: 'Pay at venue'
  },

  // Booking status, controlled by the admin
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },

  // Unique token embedded in the QR code for entry verification
  qrToken: {
    type: String,
    unique: true,
    sparse: true
  },

  // Whether the customer has been checked in at the room (via QR scan)
  checkedIn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Booking', bookingSchema);
