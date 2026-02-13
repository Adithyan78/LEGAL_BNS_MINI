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
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  const [chatId, setChatId] = useState(uuidv4());
  const [chatList, setChatList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatList(data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  /* ================= SAVE CHAT ================= */
  const saveChat = async (updatedMessages) => {
    try {
      await fetch("http://localhost:4000/chat/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          messages: updatedMessages,
          title:
            updatedMessages[1]?.text?.substring(0, 40) ||
            "New Conversation",
        }),
      });
      fetchChats();
    } catch (error) {
      console.error("Failed to save chat:", error);
    }
  };

  /* ================= LOAD CHAT ================= */
  const loadChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatId(id);
      setMessages(data.messages);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  /* ================= DELETE CHAT ================= */
  const deleteChat = async (id) => {
    try {
      await fetch(`http://localhost:4000/chat/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChats();
      if (chatId === id) newChat();
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  /* ================= NEW CHAT ================= */
  const newChat = () => {
    setChatId(uuidv4());
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your Legal AI Assistant. How can I help you with IPC/BNS legal analysis today?",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  /* ================= SEND MESSAGE ================= */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/analyze-case",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            case_description: userMsg.text,
          }),
        }
      );

      const data = await response.json();

      const assistantMsg = {
        id: Date.now() + 1,
        text: data.analysis || "⚠️ No response from AI service.",
        sender: "assistant",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      saveChat(finalMessages);
    } catch (error) {
      console.error("AI Error:", error);

      const errorMsg = {
        id: Date.now() + 1,
        text: "⚠️ AI service unavailable. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, errorMsg]);
    }

    setIsTyping(false);
  };

  /* ================= TIME FORMAT ================= */
  const formatTimestamp = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return "Just now";
    if (diff < 3600000)
      return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
      return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="chatbot-professional">
        <div
          className={`chatbot-layout ${
            !isSidebarOpen ? "sidebar-collapsed" : ""
          }`}
        >

          {/* ===== SIDEBAR ===== */}
          <aside className="chat-sidebar-modern">
            <div className="sidebar-header">
              <div className="brand-container">
                <span className="brand-icon">⚖️</span>
                <span className="brand-name">LEX AI Legal</span>
              </div>
              <button
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? "◀" : "▶"}
              </button>
            </div>

            <div className="sidebar-actions">
              <button className="new-chat-button" onClick={newChat}>
                <span className="button-icon">+</span>
                <span>New chat</span>
              </button>
            </div>

            <div className="sidebar-section">
              <div className="section-header">
                <span className="section-title">
                  Recent conversations
                </span>
                <span className="section-count">
                  {chatList.length}
                </span>
              </div>

              <div className="chat-history-list">
                {chatList.map((chat) => (
                  <div key={chat.chatId} className="history-item">
                    <button
                      className={`history-button ${
                        chatId === chat.chatId ? "active" : ""
                      }`}
                      onClick={() => loadChat(chat.chatId)}
                    >
                      <span className="history-icon">🧠</span>
                      <div className="history-content">
                        <span className="history-title">
                          {chat.title || "Untitled"}
                        </span>
                      </div>
                    </button>

                    <button
                      className="history-delete"
                      onClick={() =>
                        deleteChat(chat.chatId)
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ===== MAIN CHAT AREA ===== */}
          <main className="chat-main-area">

            <div className="messages-container-modern">
              <div className="messages-scroll">

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-row ${msg.sender}`}
                  >
                    {msg.sender === "assistant" ? (
                      <>
                        <div className="message-avatar-wrapper">
                          <div className="assistant-avatar">
                            <span className="avatar-icon">
                              ⚖️
                            </span>
                          </div>
                        </div>

                        <div className="message-content-wrapper">
                          <div className="message-sender-info">
                            <span className="sender-name">
                              Lex AI Legal
                            </span>
                            <span className="message-timestamp">
                              {formatTimestamp(
                                msg.timestamp
                              )}
                            </span>
                          </div>

                          <div className="message-bubble assistant-bubble">
                            <div className="message-text">
                              {msg.text
                                .split("\n")
                                .map((line, i) => (
                                  <p key={i}>{line}</p>
                                ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="message-content-wrapper user-wrapper">
                          <div className="message-sender-info user-info">
                            <span className="message-timestamp">
                              {formatTimestamp(
                                msg.timestamp
                              )}
                            </span>
                            <span className="sender-name user-name">
                              You
                            </span>
                          </div>

                          <div className="message-bubble user-bubble">
                            <div className="message-text">
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        </div>

                        <div className="message-avatar-wrapper user-avatar-wrapper">
                          <div className="user-avatar">
                            <span className="avatar-icon">
                              👤
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="message-row assistant">
                    <div className="message-avatar-wrapper">
                      <div className="assistant-avatar">
                        <span className="avatar-icon">
                          ⚖️
                        </span>
                      </div>
                    </div>

                    <div className="message-content-wrapper">
                      <div className="message-sender-info">
                        <span className="sender-name">
                          Lex AI Legal
                        </span>
                      </div>

                      <div className="typing-indicator-modern">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* ===== INPUT AREA ===== */}
            <div className="input-area-modern">
              <form
                onSubmit={handleSend}
                className="input-form-modern"
              >
                <div className="input-wrapper">
                  <textarea
                    className="chat-textarea"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value)
                    }
                    placeholder="Message Lex AI Legal..."
                    rows={1}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />

                  <div className="input-actions">
                    <button
                      type="submit"
                      className="send-button"
                      disabled={
                        !inputValue.trim() || isTyping
                      }
                    >
                      <span className="send-arrow">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </main>
        </div>
      </div>
    </Layout>
  );
}
