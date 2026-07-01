// ============================================================
//  Seed Script
//  Creates the default admin account and three sample rooms
//  if they do not already exist.
//
//  Run with:  npm run seed   (or: node seed/seedAdmin.js)
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');

const Admin = require('../models/Admin');
const Room = require('../models/Room');

// Default admin credentials (can be overridden in .env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@studyroom.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345';

// Sample rooms to populate the database
const sampleRooms = [
  {
    name: 'Canadian Room',
    nameEn: 'Canadian Room',
    nameAr: 'القاعة الكندية',
    size: 'Small Room',
    capacity: 4,
    pricePerHour: 5,
    description: 'A bright, quiet small room with a city view — perfect for focused individual study or a small group.',
    facilities: ['Wi-Fi', 'Whiteboard', 'Quiet Room'],
    image: 'img/room-canadian.png',
    isActive: true
  },
  {
    name: 'CCK Room',
    nameEn: 'CCK Room',
    nameAr: 'قاعة CCK',
    size: 'Medium Room',
    capacity: 8,
    pricePerHour: 8,
    description: 'A comfortable medium room with a wall TV and whiteboard — ideal for group projects and presentations.',
    facilities: ['Wi-Fi', 'Whiteboard', 'TV Screen'],
    image: 'img/room-cck.png',
    isActive: true
  },
  {
    name: 'Fawzia Room',
    nameEn: 'Fawzia Room',
    nameAr: 'قاعة فوزية',
    size: 'Large Room',
    capacity: 15,
    pricePerHour: 12,
    description: 'A spacious large hall with a projector, screen and podium — great for workshops and big meetings.',
    facilities: ['Wi-Fi', 'Whiteboard', 'Projector', 'Podium'],
    image: 'img/room-fawzia.png',
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ---------- Seed admin ----------
    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      // Make sure older accounts (created before roles existed) get a role
      if (existingAdmin.role !== 'Admin') {
        existingAdmin.role = 'Admin';
        await existingAdmin.save();
      }
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
    } else {
      // Password is hashed automatically by the Admin model's pre-save hook
      await Admin.create({ name: 'Main Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'Admin' });
      console.log(`✅ Default admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }

    // ---------- Seed a demo staff account ----------
    const STAFF_EMAIL = 'staff@roomflow.com';
    const existingStaff = await Admin.findOne({ email: STAFF_EMAIL });
    if (!existingStaff) {
      await Admin.create({ name: 'Front Desk Staff', email: STAFF_EMAIL, password: 'Staff12345', role: 'Staff' });
      console.log(`✅ Demo staff created: ${STAFF_EMAIL} / Staff12345`);
    }

    // ---------- Seed rooms ----------
    const roomCount = await Room.countDocuments();
    if (roomCount > 0) {
      console.log(`ℹ️  Rooms already exist (${roomCount}). Skipping room seed.`);
    } else {
      await Room.insertMany(sampleRooms);
      console.log(`✅ ${sampleRooms.length} sample rooms created.`);
    }

    console.log('🎉 Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
