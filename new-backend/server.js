const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-hotel');

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();
const PORT = process.env.PORT || 5432;

app.use(cors());
app.use(express.json());

let bookings = [];
let complaints = [];

const TOTAL_ROOMS = 20;

function getRoomAvailability(date) {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  checkDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkDate < today) {
    return { availableRooms: 0, totalRooms: 20 };
  }

  const bookedRoomsCount = bookings.filter(booking => {
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    return checkDate >= checkIn && checkDate <= checkOut;
  }).length;

  const availableRooms = Math.max(0, 20 - bookedRoomsCount);
  return { availableRooms, totalRooms: 20 };
}

const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

app.use('/api/bookings', bookingRoutes);
app.use('/api/complaints', complaintRoutes);

app.get("/api/availability", (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Start date and end date are required" });
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const availability = {};
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const roomAvailability = getRoomAvailability(date);
    availability[date.toISOString().split('T')[0]] = {
      availableRooms: roomAvailability.availableRooms,
      totalRooms: roomAvailability.totalRooms,
    };
  }
  res.status(200).json(availability);
});

app.get("/bookings", (req, res) => {
  let bookingsList = bookings.length > 0 ? bookings.map((booking) => `
    <div class="booking-item">
      <div class="booking-details">
        <span><strong>ID:</strong> ${booking.id}</span>
        <span><strong>Name:</strong> ${booking.name}</span>
        <span><strong>Email:</strong> ${booking.email}</span>
        <span><strong>Phone:</strong> ${booking.phone || 'N/A'}</span>
        <span><strong>Check-in Date:</strong> ${booking.check_in_date}</span>
        <span><strong>Check-out Date:</strong> ${booking.check_out_date}</span>
        <span><strong>Room Type:</strong> ${booking.room_type}</span>
        <span><strong>Number of People:</strong> ${booking.num_of_people}</span>
        <span><strong>Special Requests:</strong> ${booking.special_requests || 'None'}</span>
        <span><strong>Timestamp:</strong> ${booking.timestamp}</span>
      </div>
    </div>
  `).join('') : "<p>No bookings yet.</p>";
  res.send(bookingsList);
});

app.get("/complaints", (req, res) => {
  const complaintsList = complaints.length > 0 ? complaints.map(complaint => `
    <div class="complaint-item">
      <div class="complaint-details">
      </div>
    </div>
  `).join('') : "<p>No complaints yet.</p>";
  res.send(complaintsList);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});