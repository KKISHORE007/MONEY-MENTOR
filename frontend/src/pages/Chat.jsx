import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import '../styles/Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Money Mentor. How can I help you with your finances today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.ok ? await res.json() : null;
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile for context", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage, profile })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.text || "I'm sorry, I couldn't process that.", sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="messages-list">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.sender}`}>
              <div className="avatar">
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper bot">
              <div className="avatar"><Bot size={18} /></div>
              <div className="message-bubble loading">
                <Loader2 className="animate-spin" size={18} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your money..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

// minor safe update 14

// automated formatting update 14

// automated formatting update 39
