require('dotenv').config();
console.log('Current Directory:', process.cwd());
console.log('✅ .env Path:', require('path').join(process.cwd(), '.env'));
console.log('✅ MONGODB_URI:', process.env.MONGODB_URI);
console.log('✅ PORT:', process.env.PORT);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Import route files
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Database connection setup
console.log('ENV URI:', process.env.MONGODB_URI); // Debug log

// Validate environment variable exists
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1); // Exit with failure code
}

// Configure MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, 
  family: 4
};

// Attempt connection
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit on connection failure
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log(`📚 Connected to MongoDB database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('💥 MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB connection disconnected');
});
// Middleware stack
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Real-time socket.io handlers
io.on('connection', (socket) => {
  console.log('🔌 New client connected');
  
  socket.on('bookingUpdate', (booking) => {
    io.emit('bookingChanged', booking);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// API endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global error handler (MUST BE LAST MIDDLEWARE)
app.use(errorHandler);

// Server initialization
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
});