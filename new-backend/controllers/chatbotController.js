const axios = require('axios');
const Chat = require('../models/Chatbot');

exports.handleChat = async (req, res) => {
    const { userInput } = req.body;
    
    try {
        // Call Hugging Face API (using Zephyr-7B model)
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
            {
                inputs: `You are NOVA Hotel's AI assistant. Help with bookings, check-in (3PM), amenities (pool, free breakfast), and policies. Be friendly and concise. Never mention you're an AI.
                
                User: ${userInput}
                Assistant:`,
                parameters: {
                    max_new_tokens: 100,
                    temperature: 0.7,
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract bot response
        const botResponse = response.data[0].generated_text
            .split('Assistant:')[1]
            .trim();

        // Save to database
        await Chat.create({ userInput, botResponse });

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Hugging Face API Error:', error.response?.data || error.message);
        const fallbackResponse = "I'm currently experiencing technical difficulties. Please try again later or contact our front desk at +123-456-7890.";
        res.status(500).json({ response: fallbackResponse });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const chatHistory = await Chat.find().sort({ createdAt: -1 }).limit(50);
        res.json(chatHistory);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving chat history" });
    }
};