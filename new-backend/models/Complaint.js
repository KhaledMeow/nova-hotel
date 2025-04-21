const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true // Added index for better query performance
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
  // Additional useful fields
  category: {
    type: String,
    enum: ['service', 'facility', 'billing', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  solvedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common query patterns
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1, priority: -1 });

// Virtual property for complaint duration
complaintSchema.virtual('duration').get(function() {
  if (!this.createdAt) return null;
  const endDate = this.solvedAt || new Date();
  return Math.ceil((endDate - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save hook for status changes
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'solved' && !this.solvedAt) {
    this.solvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);