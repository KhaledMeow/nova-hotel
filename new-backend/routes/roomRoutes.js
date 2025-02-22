const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomAvailability,
  updateRoom
} = require('../controllers/roomController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

router.get('/', getAllRooms);
router.get('/availability', getRoomAvailability);
router.put('/:id', auth, adminCheck, updateRoom);

module.exports = router;