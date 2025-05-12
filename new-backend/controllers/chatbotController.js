const axios = require('axios');
const Chat = require('../models/Chatbot');

exports.handleChat = async (req, res) => {
    const { userInput } = req.body;
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
        return res.status(400).json({ response: "Please enter a valid question." });
    }
    
    const cleanInput = userInput.replace(/[^\p{L}\p{N}\s.,!?']/gu, '').trim();
    if (!cleanInput) {
        return res.status(400).json({ 
            response: "Our chat system only accepts standard text characters. For complex requests, please call +20 111 111 1111."
        });
    }

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/meta-llama/Llama-3.3-70B-Instruct',
            {
                inputs: `You are NOVA Hotel's assistant. Use the following hotel information to answer the user's question.\n\nHotel Info:\n- Check-in: After 3:00 PM | Check-out: Before 12:00 PM\n- Address: Kuala Lumpur, Malaysia\n- Wi-Fi: Complimentary for all guests\n- Room Service: Available 24/7\n- Parking: 50 spaces ($15/night), reservation required, 24/7 access\n- Room Pricing: One Bedded Room ($249/night), Deluxe Suite ($349/night), Family Room ($639/night), Penthouse Suite ($1199/night), VIP Offer ($499/night), Weekend Package ($399/night), Romantic Escape ($449/night)\n- Booking: Click ☰ menu, login/register, check availability, select room, fill details, pay online or call to reserve\n\nUser Question: ${userInput}\nAnswer:`,
                parameters: {                
                    max_new_tokens: 150, 
                    temperature: 0.5
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 
            }
        );

        console.log('HuggingFace API raw response:', JSON.stringify(response.data, null, 2));
        const fullResponse = response.data[0]?.generated_text || '';
        console.log('HuggingFace API generated_text:', fullResponse);
        let botResponse = fullResponse.split('Answer:')[1];
        if (botResponse) {
            botResponse = botResponse.trim();
        }
        if (!botResponse || botResponse.length < 2) {
            botResponse = "For immediate assistance, please contact our team at +20 111 111 1111";
        }
        botResponse = botResponse.substring(0, 500);

        await Chat.create({ 
            userInput: cleanInput, 
            botResponse 
        });
        
        res.json({ response: botResponse });

    } catch (error) {
        console.error('Chat Error:', {
            error: error.response?.data || error.message,
            input: cleanInput
        });

        const statusCode = error.response?.status || 500;
        const errorMessage = statusCode === 429 
            ? "Our chat is currently busy. Please try again in 2 minutes." 
            : "Please contact Guest Relations: +20 111 111 1111";

        await Chat.create({
            userInput: cleanInput,
            botResponse: errorMessage
        });

        res.status(statusCode).json({ response: errorMessage });
    }
};