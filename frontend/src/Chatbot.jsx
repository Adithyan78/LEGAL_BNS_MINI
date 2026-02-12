import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Layout from "./Layout";
import "./Chatbot.css";

export default function Chatbot() {
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Legal AI Assistant. How can I help you with IPC/BNS legal analysis today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);

  const [chatId, setChatId] = useState(uuidv4());
  const [chatList, setChatList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= FETCH CHATS ================= */
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("http://localhost:4000/chat/list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setChatList(data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  /* ================= SAVE ================= */
  const saveChat = async (updatedMessages) => {
    try {
      await fetch("http://localhost:4000/chat/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          chatId, 
          messages: updatedMessages,
          title: updatedMessages[0]?.text?.substring(0, 30) + "..."
        })
      });
      fetchChats();
    } catch (error) {
      console.error("Failed to save chat:", error);
    }
  };

  /* ================= DELETE ================= */
  const deleteChat = async (id) => {
    try {
      await fetch(`http://localhost:4000/chat/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchChats();

      if (chatId === id) {
        newChat(); // Changed from clearChat() to newChat()
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  /* ================= LOAD ================= */
  const loadChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      setChatId(id);
      setMessages(data.messages);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  /* ================= NEW CHAT ================= */
  const newChat = () => {
    setChatId(uuidv4());
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your Legal AI Assistant. How can I help you with IPC/BNS legal analysis today?",
        sender: "bot",
        timestamp: new Date()
      }
    ]);
  };

  /* ================= SEND ================= */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        text: getLegalResponse(inputValue),
        sender: "bot",
        timestamp: new Date()
      };

      const finalMessages = [...updated, botMsg];
      setMessages(finalMessages);
      setIsTyping(false);
      saveChat(finalMessages);
    }, 1500);
  };

  /* ================= LEGAL RESPONSES ================= */
  const getLegalResponse = (query) => {
    const responses = [
      `Based on your query about "${query.substring(0, 30)}...", I've analyzed the relevant legal provisions. Under IPC Section 302/304 and corresponding BNS Section 101/102, this appears to involve culpable homicide.`,
      `For "${query.substring(0, 30)}...", I can identify potential charges under IPC Section 378 (Theft) and BNS Section 303 (Theft). The comparative analysis shows similar punishment structures.`,
      `Analyzing your case... This description suggests possible offenses under IPC Section 420 (Cheating) and BNS Section 318 (Cheating). Would you like me to elaborate?`,
      `Based on the facts presented, this may involve criminal breach of trust under IPC Section 405 and BNS Section 316. The punishment structure differs in fine amounts.`,
      `I've processed your query. The IPC Section 323 (Voluntarily causing hurt) and BNS Section 115 apply here. Would you like a detailed comparative analysis?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  /* ================= FILE UPLOAD ================= */
  const uploadFile = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userMessage = {
      id: Date.now(),
      text: `📄 Uploaded document: ${file.name}`,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate processing
    setIsTyping(true);
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: `Document "${file.name}" received. I've analyzed the content and found relevant legal provisions. Would you like me to extract specific sections?`,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      saveChat([...messages, userMessage, botMessage]);
    }, 2000);
  };

  /* ================= RENDER ================= */
  return (
    <Layout>
      <div className="chatbot-page">
        <div className="chatbot-container">
          
          {/* Header */}
          <div className="chatbot-header">
            <h1>
              <span className="shimmer-text">⚖️ Legal AI Assistant</span>
            </h1>
            <p>AI-powered legal analysis for IPC and BNS provisions</p>
          </div>

          <div className="chatbot-main">

            {/* ===== LEFT PANEL - CHATS & CONTROLS ===== */}
            <div className="chat-sidebar">
              
              {/* New Chat Button - Prominent at top */}
              <div className="sidebar-section new-chat-section">
                <button className="new-chat-btn" onClick={newChat}>
                  <span className="new-chat-icon">➕</span>
                  <span className="new-chat-text">Start New Chat</span>
                </button>
              </div>
              
              {/* Previous Chats */}
              <div className="sidebar-section">
                <h3>
                  <span className="section-icon">📋</span>
                  Previous Chats
                </h3>
                <div className="chat-list">
                  {chatList.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">💬</span>
                      <p>No saved chats</p>
                      <span className="empty-hint">Start a new conversation</span>
                    </div>
                  ) : (
                    chatList.map(chat => (
                      <div key={chat.chatId} className="chat-item">
                        <button
                          className={`chat-item-btn ${chatId === chat.chatId ? 'active' : ''}`}
                          onClick={() => loadChat(chat.chatId)}
                        >
                          <span className="chat-icon">🧠</span>
                          <span className="chat-title-text">{chat.title || "Untitled Chat"}</span>
                        </button>
                        <button
                          className="chat-delete-btn"
                          onClick={() => deleteChat(chat.chatId)}
                          aria-label="Delete chat"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Document Upload */}
              <div className="sidebar-section">
                <h3>
                  <span className="section-icon">📁</span>
                  Document Analysis
                </h3>
                <button className="upload-btn" onClick={uploadFile}>
                  <span className="btn-icon">📎</span>
                  Upload Document
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <p className="upload-hint">
                  Supports PDF, DOC, DOCX, TXT
                </p>
              </div>

              {/* Tips */}
              <div className="sidebar-section tips-section">
                <h3>
                  <span className="section-icon">💡</span>
                  Legal Tips
                </h3>
                <ul className="tips-list">
                  <li>Ask about specific IPC/BNS sections</li>
                  <li>Describe case facts for prediction</li>
                  <li>Request comparative analysis</li>
                  <li>Upload documents for review</li>
                </ul>
              </div>
            </div>

            {/* ===== RIGHT PANEL - CHAT INTERFACE ===== */}
            <div className="chat-interface">
              
              {/* Chat Header with New Chat Option */}
              <div className="chat-interface-header">
                <div className="chat-info">
                  <span className="chat-status-dot"></span>
                  <span className="chat-status">Active Session</span>
                </div>
                <button className="chat-new-btn" onClick={newChat}>
                  <span className="new-icon">➕</span>
                  New
                </button>
              </div>

              {/* Messages */}
              <div className="messages-container">
                <div className="messages-wrapper">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message-item ${msg.sender}`}>
                      <div className="message-avatar">
                        {msg.sender === "bot" ? "⚖️" : "👤"}
                      </div>
                      <div className="message-bubble">
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="message-item bot">
                      <div className="message-avatar">⚖️</div>
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <form className="chat-input-form" onSubmit={handleSend}>
                <input
                  type="text"
                  className="chat-input-field"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your case or ask about IPC/BNS sections..."
                />
                <button 
                  type="submit" 
                  className="chat-send-btn"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <span className="send-icon">→</span>
                  Send
                </button>
              </form>

              {/* Footer */}
              <div className="chat-footer">
                <p className="disclaimer">
                  ⚖️ AI-generated legal information. Consult a qualified professional for official advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}