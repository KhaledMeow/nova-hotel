const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const chatSchema = new mongoose.Schema({
    userInput: { type: String, required: true },
    botResponse: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Chatbot = mongoose.model('Chatbot', chatSchema);
module.exports = Chatbot;