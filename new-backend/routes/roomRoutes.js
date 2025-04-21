const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const {
  getAllRooms,
  getRoomAvailability,
  updateRoom
} = require('../controllers/roomController');


router.get('/availability', getRoomAvailability);
router.get('/', getAllRooms);
router.put('/:id', updateRoom);

module.exports = router;