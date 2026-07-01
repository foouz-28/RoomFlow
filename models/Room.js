// ============================================================
//  Room Model
//  Represents a single study room that customers can book.
// ============================================================

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Display name of the room (legacy / fallback - kept for compatibility)
  name: {
    type: String,
    required: true,
    trim: true
  },

  // English name (shown in English mode)
  nameEn: {
    type: String,
    default: '',
    trim: true
  },

  // Arabic name (shown in Arabic mode)
  nameAr: {
    type: String,
    default: '',
    trim: true
  },

  // Size label of the room (e.g. "Small Room", "Medium Room", "Large Room")
  size: {
    type: String,
    required: true,
    trim: true
  },

  // Maximum number of people allowed in the room
  capacity: {
    type: Number,
    required: true,
    min: 1
  },

  // Price per hour (in KWD)
  pricePerHour: {
    type: Number,
    required: true,
    min: 0
  },

  // Free text description of the room
  description: {
    type: String,
    default: '',
    trim: true
  },

  // List of facilities, e.g. ["Wi-Fi", "Whiteboard", "Projector", "Quiet Room"]
  facilities: {
    type: [String],
    default: []
  },

  // Image URL or path. A placeholder is used when empty.
  image: {
    type: String,
    default: ''
  },

  // Whether the room is active and shown to the public
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Room', roomSchema);
