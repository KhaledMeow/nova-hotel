const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['guest', 'staff', 'admin']
  },
  permissions: [{
    type: String,
    enum: [
      'create_booking', 
      'manage_bookings', 
      'manage_users', 
      'view_reports'
    ]
  }]
});

module.exports = mongoose.model('Role', roleSchema);