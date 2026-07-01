// ============================================================
//  Study Room Booking System - Main Server File
//  Sets up Express, connects to MongoDB, serves the frontend
//  and mounts the API routes.
// ============================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());                 // allow cross-origin requests
app.use(express.json());         // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Serve all static frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API Routes ----------
app.use('/api', publicRoutes);          // /api/rooms, /api/bookings
app.use('/api/admin', adminRoutes);     // /api/admin/login, etc.

// ---------- Database Connection ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Check your MONGO_URI value inside the .env file.');
    process.exit(1);
  });
