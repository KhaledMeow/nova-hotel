const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please enter a valid email address'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: [20, 'Message must be at least 20 characters'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['open','in progress', 'solved'],
    default: 'open',
  },
  category: {
    type: String,
    enum: ['service', 'facility', 'billing', 'other'],
    default: 'other'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1 });

complaintSchema.virtual('duration').get(function() {
  if (!this.createdAt) return null;
  const endDate = new Date();
  return Math.ceil((endDate - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Complaint', complaintSchema);