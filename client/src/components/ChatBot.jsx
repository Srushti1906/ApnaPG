import React, { useState, useEffect, useRef } from "react";
import { FiHome, FiSend, FiX, FiMessageCircle, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import "./ChatBot.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage = {
        id: Date.now(),
        from: "bot",
        text: "Hi there! 👋 Welcome to ApnaPG! I'm your AI assistant. I can help you find PGs, answer questions about bookings, amenities, pricing, and anything else about our platform. What can I help you with?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      from: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send message to backend chatbot
      const response = await axios.post(
        `${API_BASE_URL}/chatbot/chat`,
        {
          message: inputValue,
          conversationHistory: messages,
        },
        {
          timeout: 15000,
        }
      );

      const botMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: response.data.reply,
        timestamp: new Date(),
        status: response.data.status,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        from: "bot",
        text:
          error.response?.data?.error ||
          "Sorry, I encountered an issue. Please make sure:\n1. The server is running\n2. ANTHROPIC_API_KEY is set in server .env (optional for fallback mode)\n\nTry again or refresh the page!",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Toggle chatbot open/close
  const toggleChatBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot Widget */}
      {isOpen && (
        <div className="chatbot-widget">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-title-section">
                <FiHome className="chatbot-home-icon" />
                <h3>ApnaPG Assistant</h3>
              </div>
              <p>AI-Powered Help</p>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={toggleChatBot}
              aria-label="Close chatbot"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.from} ${message.isError ? "error" : ""}`}
              >
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask me anything about ApnaPG..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chatbot-floating-btn ${isOpen ? "open" : ""}`}
        onClick={toggleChatBot}
        aria-label="Open chatbot"
        title={isOpen ? "Close Assistant" : "Open Assistant"}
      >
        {isOpen ? (
          <FiChevronDown size={24} />
        ) : (
          <>
            <FiHome size={20} />
            <FiMessageCircle size={14} className="notification-icon" />
          </>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="chatbot-tooltip">
          Chat with our AI Assistant!
        </div>
      )}
    </div>
  );
}
