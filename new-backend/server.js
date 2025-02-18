const express = require("express");
const cors = require("cors");
const { BsCalendarDate } = require("react-icons/bs");
require("dotenv").config();
const Llama2 = require('llama2'); // Import Llama 2

const app = express();
const PORT = process.env.PORT || 5432;

app.use(cors());
app.use(express.json());

let bookingCounter = 1;
let bookings = [];
let complaintCounter = 1;
let complaints = [];

const TOTAL_ROOMS = 20;
const selectedDates = [];
let bookingDatesCounter = 1;
let bookingDates = [];
const bookingDatesList = [];

// Global variable to store dates
let dateDisplay = {
  startDate: null,
  endDate: null
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function getRoomAvailability(date) {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  checkDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkDate < today) {
    return {
      availableRooms: 0,
      totalRooms: 20
    };
  }

  const bookedRoomsCount = bookings.filter(booking => {
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    return checkDate >= checkIn && checkDate <= checkOut;
  }).length;

  const availableRooms = Math.max(0, 20 - bookedRoomsCount);
  return {
    availableRooms: availableRooms,
    totalRooms: 20,
    bookedRooms: bookedRoomsCount
  };
}

const complaintRoutes = require('./routes/complaintRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api', complaintRoutes);
app.use('/api', bookingRoutes);

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
      bookedRooms: roomAvailability.bookedRooms
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
        <span><strong>Check-in Date:</strong> ${dateDisplay.startDate || 'No Date'}</span>
        <span><strong>Check-out Date:</strong> ${dateDisplay.endDate || 'No Date'}</span>
        <span><strong>Room Type:</strong> ${booking.room_type}</span>
        <span><strong>Number of People:</strong> ${booking.num_of_people}</span>
        <span><strong>Special Requests:</strong> ${booking.special_requests || 'None'}</span>
        <span><strong>Timestamp:</strong> ${booking.timestamp}</span>
      </div>
    </div>
  `).join('') : "<p>No bookings yet.</p>";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Current Bookings</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #333;
            color: #f4f4f4;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #444;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #f4f4f4;
            text-align: center;
            border-bottom: 2px solid #fca53a;
            padding-bottom: 10px;
          }
          .booking-item {
            background-color: #555;
            border-left: 4px solid #fca53a;
            margin: 20px 0;
            padding: 15px;
            border-radius: 0 5px 5px 0;
          }
          .booking-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }
          .booking-details span {
            display: block;
            color: #f4f4f4;
          }
          .booking-details strong {
            color: #fca53a;
            margin-right: 5px;
          }
          p {
            text-align: center;
            color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Current Bookings</h1>
          <div>${bookingsList}</div>
        </div>
      </body>
    </html>
  `;

  res.send(htmlContent);
});

app.get("/complaints", (req, res) => {
  const complaintsList = complaints.length > 0 ? complaints.map(complaint => `
    <div class="complaint-item">
      <div class="complaint-details">
        <span><strong>ID:</strong> ${complaint.id}</span>
        <span><strong>Name:</strong> ${complaint.name}</span>
        <span><strong>Email:</strong> ${complaint.email}</span>
        <span><strong>Message:</strong> ${complaint.message}</span>
        <span><strong>Timestamp:</strong> ${complaint.timestamp}</span>
      </div>
    </div>
  `).join('') : "<p>No complaints yet.</p>";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Current Complaints</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #333;
            color: #f4f4f4;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #444;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #f4f4f4;
            text-align: center;
            border-bottom: 2px solid #fca53a;
            padding-bottom: 10px;
          }
          .complaint-item {
            background-color: #555;
            border-left: 4px solid #fca53a;
            margin: 20px 0;
            padding: 15px;
            border-radius: 0 5px 5px 0;
          }
          .complaint-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }
          .complaint-details span {
            display: block;
            color: #f4f4f4;
          }
          .complaint-details strong {
            color: #fca53a;
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Current Complaints</h1>
          <div>${complaintsList}</div>
        </div>
      </body>
    </html>
  `;

  res.send(htmlContent);
});

app.post('/api/chat', async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ response: 'User input is required.' });
  }

  console.log('User input:', userInput); // Log user input

  try {
    const response = await llama2.chat({
      model: 'llama2',
      messages: [{ role: 'user', content: userInput }],
    });

    console.log('Llama 2 response:', response); // Log Llama 2 response

    const botResponse = response.choices[0].message.content;
    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error communicating with Llama 2:', error);
    res.status(500).json({ response: 'An error occurred while processing the request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});