// ============================================================
//  Admin / Staff Account Model
//  Represents a back-office account. Supports multiple roles:
//   - Admin : full access (manage rooms, accounts, everything)
//   - Staff : day-to-day operations (view/manage bookings, scan QR)
//  Passwords are stored hashed with bcrypt (never in plain text).
//  (Students are public customers and book by email; they do not
//   have a back-office account — see the "My Bookings" page.)
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Display name of the account holder
  name: {
    type: String,
    default: '',
    trim: true
  },

  // Email (used for login, must be unique)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  // Hashed password
  password: {
    type: String,
    required: true
  },

  // Role / permission level
  role: {
    type: String,
    enum: ['Admin', 'Staff'],
    default: 'Admin'
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Hash the password before saving (only when it changed)
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plain password with the stored hash
adminSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
