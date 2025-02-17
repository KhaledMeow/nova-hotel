import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import "../styles/ChatBotComponent.css";

const ChatBotComponent = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! Welcome to NOVA Hotel. How can I assist you today?",
      bot: true,
    },
  ]);
  const [userInput, setUserInput] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen((prevState) => !prevState);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userInput.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, bot: false },
      ]);

      try {
        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userInput }),
        });

        const data = await response.json();
        const botResponse =
          data.response || "I'm sorry, I didn't understand that.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botResponse, bot: true },
        ]);
      } catch (error) {
        console.error("Error fetching from backend:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "I'm having trouble responding at the moment. Please try again later.",
            bot: true,
          },
        ]);
      }

      setUserInput("");
    }
  };

  return (
    <div className={`chatbot-container ${isChatOpen ? "open" : ""}`}>
      <div className="chatbot-header" onClick={toggleChat}>
        {isChatOpen ? <FaTimes size={30} /> : <FaComments size={30} />}
      </div>
      {isChatOpen && (
        <div className="chatbot-box">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.bot ? "bot-message" : "user-message"}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <form className="chatbot-input-form" onSubmit={handleUserSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="chatbot-input"
              placeholder="location, transport, help, about, etc..."
            />
            <button type="submit" className="chatbot-send-button">
              <strong>Send</strong>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBotComponent;
