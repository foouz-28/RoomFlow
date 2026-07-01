// ============================================================
//  updateRooms.js  -  One-off script to rename the three rooms
//  and attach their real photos. Matches existing rooms by
//  capacity order (smallest -> largest) so it works even if the
//  names were already changed.
//
//  Run with:  node seed/updateRooms.js
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');

// New room details, in order of capacity (small, medium, large)
const updates = [
  {
    name: 'Canadian Room',
    nameEn: 'Canadian Room',
    nameAr: 'القاعة الكندية',
    size: 'Small Room',
    image: 'img/room-canadian.png',
    facilities: ['Wi-Fi', 'Whiteboard', 'Quiet Room'],
    description: 'A bright, quiet small room with a city view — perfect for focused individual study or a small group.'
  },
  {
    name: 'CCK Room',
    nameEn: 'CCK Room',
    nameAr: 'قاعة CCK',
    size: 'Medium Room',
    image: 'img/room-cck.png',
    facilities: ['Wi-Fi', 'Whiteboard', 'TV Screen'],
    description: 'A comfortable medium room with a wall TV and whiteboard — ideal for group projects and presentations.'
  },
  {
    name: 'Fawzia Room',
    nameEn: 'Fawzia Room',
    nameAr: 'قاعة فوزية',
    size: 'Large Room',
    image: 'img/room-fawzia.png',
    facilities: ['Wi-Fi', 'Whiteboard', 'Projector', 'Podium'],
    description: 'A spacious large hall with a projector, screen and podium — great for workshops and big meetings.'
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const rooms = await Room.find().sort({ capacity: 1 });
    if (rooms.length < 3) {
      console.log('⚠️  Fewer than 3 rooms found. Run "npm run seed" first.');
      process.exit(0);
    }

    for (let i = 0; i < updates.length && i < rooms.length; i++) {
      Object.assign(rooms[i], updates[i]);
      await rooms[i].save();
      console.log(`✅ Updated room -> ${updates[i].name} (${rooms[i].capacity} people)`);
    }

    console.log('🎉 Rooms updated with names and photos.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
