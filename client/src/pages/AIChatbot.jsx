import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from "react-icons/fa";
import "../styles/AIChatbot.css";

const AIChatbot = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const botMessage = { role: "bot", text: data.response || "No response" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chatbot-container">
      {/* Header */}
      <div className="ai-chatbot-header">
        <div className="ai-chatbot-title">
          <FaRobot className="ai-icon" />
          <h2>AI Assistant</h2>
        </div>
        <p className="ai-subtitle">Ask me anything! I'm here to help you with your questions.</p>
      </div>

      {/* Chat Window */}
      <div className="ai-chat-window">
        {messages.length === 0 ? (
          <div className="ai-welcome-message">
            <FaRobot className="welcome-icon" />
            <h3>Welcome to AI Assistant!</h3>
            <p>I can help you with various tasks. Just type your question below and I'll do my best to assist you.</p>
            <div className="ai-suggestions">
              <p>Try asking me about:</p>
              <ul>
                <li>General knowledge questions</li>
                <li>Programming help</li>
                <li>Writing assistance</li>
                <li>Problem solving</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="ai-messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                <div className="ai-message-avatar">
                  {msg.role === "user" ? <FaUser /> : <FaRobot />}
                </div>
                <div className="ai-message-content">
                  <div className="ai-message-text">{msg.text}</div>
                  <div className="ai-message-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message bot">
                <div className="ai-message-avatar">
                  <FaRobot />
                </div>
                <div className="ai-message-content">
                  <div className="ai-loading-indicator">
                    <FaSpinner className="spinner" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="ai-input-container">
        <div className="ai-input-wrapper">
          <input
            type="text"
            value={prompt}
            placeholder="Type your question here..."
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            className="ai-input"
            disabled={loading}
          />
          <button 
            onClick={handleSend} 
            disabled={!prompt.trim() || loading}
            className="ai-send-button"
          >
            <FaPaperPlane />
          </button>
        </div>
        <p className="ai-input-hint">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default AIChatbot;
