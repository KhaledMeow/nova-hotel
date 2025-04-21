const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const chatbotController = require('../controllers/chatbotController');

router.post('/', chatbotController.handleChat);

module.exports = router;