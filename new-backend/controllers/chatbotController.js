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
                inputs: `<|system|>
                You are NOVA Hotel's AI assistant. Use this information to assist:

                ## Hotel Basics
                - Check-in: After 3:00 PM | Check-out: Before 12:00 PM
                - Address: AOU Arab Open University,El-Shorouk, Cairo, Egypt
                - Wi-Fi: Complimentary for all guests
                - Room Service: Available 24/7

                ## Parking
                - 50 spaces ($15/night with in/out privileges)
                - Reservation required: Call +20 111 111 1111
                - Hours: 24/7 access
                - No online payment - cash/credit card at exit

                ## Room Pricing
                1. One Bedded Room ($249/night):
                2. Deluxe Suite ($349/night):
                3. Family Room ($639/night):
                4. Penthouse Suite ($1199/night):
                5. VIP Offer ($499/night):
                6. Weekend Package ($399/night):
                7. Romantic Escape ($449/night):

                ## Booking Process
                Start: Click ☰ menu (top-right)
                Account: (Login or Register)
                Search: Click "Check Availability" (header button)
                Select: Choose room from cards
                Details: Fill booking information
                Payment: (Online or Cash)
                - Online: "Proceed to Payment" → Enter card details → "Pay $..."
                - Cash: Call +20 111 111 1111 to reserve booking

                ## Response Rules
                1. For general questions:
                - Use simple terms (no technical terms)
                - Keep answers simple if necessary
                - Never mention being AI, just that you are here to help
                2. For unavailable services suggest:
                "Please contact our Guest Relations team at +20 111 222 2222"</s>
                ${userInput}</s>
                <assistant>`,
                parameters: {                
                    max_new_tokens: 150,  // Increased for better responses
                    temperature: 0.6,     // More focused answers
                    stop: ["</s>", "User:", "user:", "\n\n"]
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000  // Added timeout
            }
        );

        // Enhanced response parsing
        const fullResponse = response.data[0]?.generated_text || '';
        let botResponse = fullResponse
            .split('<assistant>')[1]
            ?.replace(/<\/?s>/g, '')  // Remove any remaining tags
            ?.replace(/User:.*/s, '')
            ?.trim();

        // Fallback response
        if (!botResponse || botResponse.length < 2) {
            botResponse = "For immediate assistance, please contact our team at +20 111 111 1111";
        }

        // Ensure valid response length
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

        // Save error response to DB
        await Chat.create({
            userInput: cleanInput,
            botResponse: errorMessage
        });

        res.status(statusCode).json({ response: errorMessage });
    }
};