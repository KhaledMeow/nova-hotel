require('dotenv').config();
console.log('✅ Current Directory:', process.cwd());
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

const chatbotRoutes = require('./routes/chatbotRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: ['https://localhost:3000'],
  credentials: true
}));
const server = http.createServer(app);

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many chat requests from this IP, please try again later"
});
app.use('/api/v1/chatbot', chatLimiter);

const io = socketIo(server, {
  cors: {
    origin: ['https://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

console.log('✅ ENV URI:', process.env.MONGODB_URI); 

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1); 
}

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, 
  family: 4
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); 
  });

mongoose.connection.on('connected', () => {
  console.log('📚 Connected to MongoDB database: ${mongoose.connection.name}');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB connection disconnected');
});
app.use(helmet());
app.use(cors({
  origin: ['https://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

io.on('connection', (socket) => {
  console.log('🔌 New client connected');
  
  socket.on('bookingUpdate', (booking) => {
    io.emit('bookingChanged', booking);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('✅ Server running in ${process.env.NODE_ENV || development} mode');
  console.log('✅ Listening on port ${PORT}');
  console.log('✅ Client URL: https://localhost:3000');
  console.log('✅ Server URL: http://localhost:5000');
});