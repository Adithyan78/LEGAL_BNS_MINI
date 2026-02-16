import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Layout from "./Layout";
import "./Chatbot.css";

export default function Chatbot() {
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(uuidv4());
  const [chatList, setChatList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const thinkingIntervalRef = useRef(null);

  /* ================= THINKING MESSAGES ================= */
  const thinkingMessages = [
    "🔍 Analyzing your legal query...",
    "📚 Searching IPC/BNS databases...",
    "⚖️ Reviewing relevant sections...",
    "🔬 Examining case precedents...",
    "📖 Cross-referencing legal provisions...",
    "🧠 Processing legal context...",
    "⚡ Formulating comprehensive analysis...",
    "📋 Structuring legal response...",
  ];

  /* ================= SUGGESTED PROMPTS ================= */
  const suggestedPrompts = [
    {
      icon: "⚖️",
      title: "Analyze a Legal Case",
      description: "Get detailed IPC/BNS analysis for any legal scenario",
      prompt: "I need help analyzing a legal case involving...",
    },
    {
      icon: "📋",
      title: "Section Explanation",
      description: "Understand specific IPC or BNS sections",
      prompt: "Can you explain IPC Section 420 and its implications?",
    },
    {
      icon: "🔍",
      title: "Case Law Research",
      description: "Find relevant case laws and precedents",
      prompt: "What are the landmark judgments related to...",
    },
    {
      icon: "💼",
      title: "Legal Documentation",
      description: "Draft legal notices, contracts, or petitions",
      prompt: "Help me draft a legal notice for...",
    },
  ];

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, thinkingMessage]);

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
            updatedMessages[0]?.text?.substring(0, 40) ||
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
    setMessages([]);
    setInputValue("");
    setStreamingText("");
    setThinkingMessage("");
  };

  /* ================= ROTATE THINKING MESSAGES ================= */
  const startThinking = () => {
    let index = 0;
    setThinkingMessage(thinkingMessages[0]);
    
    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % thinkingMessages.length;
      setThinkingMessage(thinkingMessages[index]);
    }, 2000); // Change message every 2 seconds
  };

  const stopThinking = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
    setThinkingMessage("");
  };

  /* ================= STREAMING SUPPORT ================= */
  const handleSendWithStreaming = async (e, promptText = null) => {
    e?.preventDefault();
    const messageText = promptText || inputValue;
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);
    setStreamingText("");
    
    // Start thinking animation
    startThinking();

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
      
      // Stop thinking animation
      stopThinking();

      // Simulate streaming effect character by character
      const fullText = data.analysis || "⚠️ No response from AI service.";
      let currentIndex = 0;
      
      const streamInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          // Add characters in chunks for smoother effect (2-5 chars at a time)
          const chunkSize = Math.floor(Math.random() * 4) + 2;
          const chunk = fullText.slice(currentIndex, currentIndex + chunkSize);
          currentIndex += chunkSize;
          
          setStreamingText((prev) => prev + chunk);
        } else {
          // Streaming complete
          clearInterval(streamInterval);
          
          const assistantMsg = {
            id: Date.now() + 1,
            text: fullText,
            sender: "assistant",
            timestamp: new Date(),
          };

          const finalMessages = [...updatedMessages, assistantMsg];
          setMessages(finalMessages);
          setStreamingText("");
          setIsTyping(false);
          saveChat(finalMessages);
        }
      }, 30); // Adjust speed here (lower = faster typing)

    } catch (error) {
      console.error("AI Error:", error);
      stopThinking();

      const errorMsg = {
        id: Date.now() + 1,
        text: "⚠️ AI service unavailable. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, errorMsg]);
      setStreamingText("");
      setIsTyping(false);
    }
  };

  /* ================= REAL STREAMING (if your backend supports it) ================= */
  const handleSendWithRealStreaming = async (e, promptText = null) => {
    e?.preventDefault();
    const messageText = promptText || inputValue;
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);
    setStreamingText("");
    
    startThinking();

    try {
      // For real streaming, you'd need backend support for SSE or chunked responses
      const response = await fetch(
        "http://localhost:4000/api/analyze-case-stream", // Note: different endpoint
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

      stopThinking();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Streaming complete
          const assistantMsg = {
            id: Date.now() + 1,
            text: accumulatedText,
            sender: "assistant",
            timestamp: new Date(),
          };

          const finalMessages = [...updatedMessages, assistantMsg];
          setMessages(finalMessages);
          setStreamingText("");
          setIsTyping(false);
          saveChat(finalMessages);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setStreamingText(accumulatedText);
      }

    } catch (error) {
      console.error("Streaming Error:", error);
      stopThinking();
      
      // Fall back to regular request
      handleSendWithStreaming(null, messageText);
    }
  };

  // Choose which send handler to use
  const handleSend = handleSendWithRealStreaming; // Use simulated streaming by default

  /* ================= HANDLE PROMPT CLICK ================= */
  const handlePromptClick = (prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  /* ================= TIME FORMAT ================= */
  const formatTimestamp = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  /* ================= FILTER CHATS ================= */
  const filteredChats = chatList.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= RENDER MESSAGE TEXT ================= */
  const renderMessageText = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        const lines = code.split('\n');
        const language = lines[0].trim();
        const codeContent = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="lex-code-block">
            <div className="lex-code-header">
              <span className="lex-code-language">{language || 'code'}</span>
              <button 
                className="lex-code-copy"
                onClick={() => navigator.clipboard.writeText(codeContent)}
              >
                Copy
              </button>
            </div>
            <pre className="lex-code-content">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }
      
      return part.split('\n\n').map((paragraph, pIndex) => {
        if (!paragraph.trim()) return null;
        
        if (paragraph.includes('\n- ') || paragraph.includes('\n• ')) {
          const items = paragraph.split('\n').filter(line => 
            line.trim().startsWith('-') || line.trim().startsWith('•')
          );
          return (
            <ul key={`${index}-${pIndex}`} className="lex-message-list">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^[-•]\s*/, '').trim()}</li>
              ))}
            </ul>
          );
        }
        
        if (/^\d+\./.test(paragraph.trim())) {
          const items = paragraph.split('\n').filter(line => 
            /^\d+\./.test(line.trim())
          );
          return (
            <ol key={`${index}-${pIndex}`} className="lex-message-list">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^\d+\.\s*/, '').trim()}</li>
              ))}
            </ol>
          );
        }
        
        const formattedText = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return (
          <p 
            key={`${index}-${pIndex}`} 
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      });
    });
  };
  /* ================= LEGAL RESPONSE RENDERER ================= */

const LegalResponseRenderer = ({ text }) => {

  const [expandedSections, setExpandedSections] = useState({});
  const [expandedBlocks, setExpandedBlocks] = useState({});

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleBlock = (key) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const parseSections = (text) => {

    const lines = text.split("\n");

    const sections = [];
    let current = null;
    let conclusion = null;
    let mode = null;

    lines.forEach(line => {

      if (line.includes("APPLICABLE SECTION")) {

        if (current) sections.push(current);

        current = {
          title: line,
          definition: "",
          ingredients: "",
          reasoning: "",
          punishment: ""
        };

        mode = null;
      }

      else if (line.includes("SECTION DEFINITION"))
        mode = "definition";

      else if (line.includes("ESSENTIAL INGREDIENTS"))
        mode = "ingredients";

      else if (line.includes("LEGAL REASONING"))
        mode = "reasoning";

      else if (line.includes("PRESCRIBED PUNISHMENT"))
        mode = "punishment";

      else if (line.includes("FINAL LEGAL CONCLUSION")) {

        if (current) sections.push(current);

        conclusion = {
          title: line,
          content: ""
        };

        mode = "conclusion";
      }

      else {

        if (mode === "conclusion")
          conclusion.content += line + "\n";

        else if (current && mode)
          current[mode] += line + "\n";
      }

    });

    if (current) sections.push(current);
    if (conclusion) sections.push(conclusion);

    return sections;
  };

  const sections = parseSections(text);

  return (
    <div className="lex-legal-container">

      {sections.map((section, index) => {

        if (section.content !== undefined) {

          const expanded = expandedSections[index] ?? true;

          return (
            <div className="lex-conclusion-card" key={index}>

              <div
                className="lex-conclusion-header"
                onClick={() => toggleSection(index)}
              >
                {section.title}
                <span>{expanded ? "▾" : "▸"}</span>
              </div>

              {expanded && (
                <div className="lex-conclusion-body">
                  {section.content}
                </div>
              )}

            </div>
          );
        }

        const expanded = expandedSections[index] ?? true;

        return (
          <div className="lex-legal-card" key={index}>

            <div
              className="lex-legal-card-header"
              onClick={() => toggleSection(index)}
            >
              {section.title}
              <span>{expanded ? "▾" : "▸"}</span>
            </div>

            {expanded && (
              <div className="lex-legal-card-body">

                {section.definition && (
                  <div className="lex-legal-block">
                    <div className="lex-block-title">
                      Section Definition
                    </div>
                    <div className="lex-block-content">
                      {section.definition}
                    </div>
                  </div>
                )}

                {section.ingredients && (
                  <div className="lex-legal-block">
                    <div className="lex-block-title">
                      Essential Ingredients
                    </div>
                    <div className="lex-block-content">
                      {section.ingredients}
                    </div>
                  </div>
                )}

                {section.reasoning && (
                  <div className="lex-legal-block">

                    <div
                      className="lex-block-title clickable"
                      onClick={() => toggleBlock(index + "-reason")}
                    >
                      Legal Reasoning
                      <span>
                        {(expandedBlocks[index + "-reason"] ?? false)
                          ? "▾"
                          : "▸"}
                      </span>
                    </div>

                    {(expandedBlocks[index + "-reason"] ?? false) && (
                      <div className="lex-block-content">
                        {section.reasoning}
                      </div>
                    )}

                  </div>
                )}

                {section.punishment && (
                  <div className="lex-legal-block danger">

                    <div
                      className="lex-block-title clickable"
                      onClick={() => toggleBlock(index + "-punish")}
                    >
                      Punishment
                      <span>
                        {(expandedBlocks[index + "-punish"] ?? false)
                          ? "▾"
                          : "▸"}
                      </span>
                    </div>

                    {(expandedBlocks[index + "-punish"] ?? false) && (
                      <div className="lex-block-content">
                        {section.punishment}
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>
        );

      })}

    </div>
  );
};


  /* ================= UI ================= */
  return (
    <Layout>
      <div className="lex-chatbot-professional">
        <div
          className={`lex-chatbot-layout ${
            !isSidebarOpen ? "lex-sidebar-collapsed" : ""
          }`}
        >
          {/* ===== SIDEBAR ===== */}
          <aside className="lex-chat-sidebar-modern">
            <div className="lex-sidebar-header">
              <div className="lex-brand-container">
                <span className="lex-brand-icon">⚖️</span>
                <span className="lex-brand-name">LEX AI Legal</span>
              </div>
              <button
                className="lex-sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isSidebarOpen ? "◀" : "▶"}
              </button>
            </div>

            <div className="lex-sidebar-actions">
              <button className="lex-new-chat-button" onClick={newChat}>
                <span className="lex-button-icon">+</span>
                <span>New chat</span>
              </button>
            </div>

            <div className="lex-sidebar-search">
              <div className="lex-search-wrapper">
                <span className="lex-search-icon">🔍</span>
                <input
                  type="text"
                  className="lex-search-input"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="lex-search-clear"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="lex-sidebar-section">
              <div className="lex-section-header">
                <span className="lex-section-title">
                  {searchQuery ? "Search Results" : "Recent conversations"}
                </span>
                <span className="lex-section-count">
                  {filteredChats.length}
                </span>
              </div>

              <div className="lex-chat-history-list">
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <div key={chat.chatId} className="lex-history-item">
                      <button
                        className={`lex-history-button ${
                          chatId === chat.chatId ? "lex-active" : ""
                        }`}
                        onClick={() => loadChat(chat.chatId)}
                        title={chat.title}
                      >
                        <span className="lex-history-icon">💬</span>
                        <div className="lex-history-content">
                          <span className="lex-history-title">
                            {chat.title || "Untitled"}
                          </span>
                          <span className="lex-history-date">
                            {formatTimestamp(chat.updatedAt || chat.createdAt)}
                          </span>
                        </div>
                      </button>

                      <button
                        className="lex-history-delete"
                        onClick={() => deleteChat(chat.chatId)}
                        title="Delete conversation"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="lex-empty-state-modern">
                    <span className="lex-empty-icon">🔍</span>
                    <p className="lex-empty-text">No conversations found</p>
                    <p className="lex-empty-hint">
                      {searchQuery
                        ? "Try a different search term"
                        : "Start a new conversation"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ===== MAIN CHAT AREA ===== */}
          <main className="lex-chat-main-area">
            <div className="lex-messages-container-modern">
              <div className="lex-messages-scroll">
                {messages.length === 0 && !streamingText ? (
                  /* ===== WELCOME SCREEN ===== */
                  <div className="lex-welcome-screen">
                    <div className="lex-welcome-header">
                      <div className="lex-welcome-icon">⚖️</div>
                      <h1 className="lex-welcome-title">
                        Welcome to LEX AI Legal Assistant
                      </h1>
                      <p className="lex-welcome-subtitle">
                        Your intelligent legal companion for IPC/BNS analysis,
                        case research, and legal documentation
                      </p>
                    </div>

                    <div className="lex-prompt-cards">
                      {suggestedPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          className="lex-prompt-card"
                          onClick={() => handlePromptClick(prompt.prompt)}
                        >
                          <div className="lex-prompt-icon">{prompt.icon}</div>
                          <div className="lex-prompt-content">
                            <h3 className="lex-prompt-title">
                              {prompt.title}
                            </h3>
                            <p className="lex-prompt-description">
                              {prompt.description}
                            </p>
                          </div>
                          <div className="lex-prompt-arrow">→</div>
                        </button>
                      ))}
                    </div>

                    <div className="lex-welcome-footer">
                      <div className="lex-feature-pills">
                        <span className="lex-feature-pill">
                          <span className="lex-pill-icon">⚡</span>
                          Instant Analysis
                        </span>
                        <span className="lex-feature-pill">
                          <span className="lex-pill-icon">🔒</span>
                          Secure & Confidential
                        </span>
                        <span className="lex-feature-pill">
                          <span className="lex-pill-icon">📚</span>
                          Comprehensive Database
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===== CHAT MESSAGES ===== */
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`lex-message-row lex-${msg.sender}`}
                      >
                        {msg.sender === "assistant" ? (
                          <>
                            <div className="lex-message-avatar-wrapper">
                              <div className="lex-assistant-avatar">
                                <span className="lex-avatar-icon">⚖️</span>
                              </div>
                            </div>

                            <div className="lex-message-content-wrapper">
                              <div className="lex-message-sender-info">
                                <span className="lex-sender-name">
                                  LEX AI Legal
                                </span>
                                <span className="lex-message-timestamp">
                                  {formatTimestamp(msg.timestamp)}
                                </span>
                              </div>

                              <div className="lex-message-bubble lex-assistant-bubble">
                                <div className="lex-message-text">
                                  <LegalResponseRenderer text={msg.text} />

                                </div>
                              </div>

                              <div className="lex-safety-line">
                                <span className="lex-safety-icon">⚠️</span>
                                <span className="lex-safety-text">This analysis is based solely on the facts provided and may change if additional evidence or circumstances emerge.AI-generated response. Always verify legal information independently.</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="lex-message-content-wrapper lex-user-wrapper">
                              <div className="lex-message-sender-info lex-user-info">
                                <span className="lex-message-timestamp">
                                  {formatTimestamp(msg.timestamp)}
                                </span>
                                <span className="lex-sender-name lex-user-name">
                                  You
                                </span>
                              </div>

                              <div className="lex-message-bubble lex-user-bubble">
                                <div className="lex-message-text">
                                  <p>{msg.text}</p>
                                </div>
                              </div>
                            </div>

                            <div className="lex-message-avatar-wrapper lex-user-avatar-wrapper">
                              <div className="lex-user-avatar">
                                <span className="lex-avatar-icon">👤</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* THINKING INDICATOR */}
                    {thinkingMessage && (
                      <div className="lex-message-row lex-assistant">
                        <div className="lex-message-avatar-wrapper">
                          <div className="lex-assistant-avatar lex-thinking-avatar">
                            <span className="lex-avatar-icon">⚖️</span>
                          </div>
                        </div>

                        <div className="lex-message-content-wrapper">
                          <div className="lex-message-sender-info">
                            <span className="lex-sender-name">
                              LEX AI Legal
                            </span>
                          </div>

                          <div className="lex-thinking-bubble">
                            <span className="lex-thinking-text">
                              {thinkingMessage}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STREAMING TEXT */}
                    {streamingText && (
                      <div className="lex-message-row lex-assistant">
                        <div className="lex-message-avatar-wrapper">
                          <div className="lex-assistant-avatar">
                            <span className="lex-avatar-icon">⚖️</span>
                          </div>
                        </div>

                        <div className="lex-message-content-wrapper">
                          <div className="lex-message-sender-info">
                            <span className="lex-sender-name">
                              LEX AI Legal
                            </span>
                            <span className="lex-message-timestamp">
                              Just now
                            </span>
                          </div>

                          <div className="lex-message-bubble lex-assistant-bubble lex-streaming-bubble">
                            <div className="lex-message-text">
                              {renderMessageText(streamingText)}
                              <span className="lex-cursor-blink">▋</span>
                            </div>
                          </div>

                          <div className="lex-safety-line">
                            <span className="lex-safety-icon">⚠️</span>
                            <span className="lex-safety-text">AI-generated response. Always verify legal information independently.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REGULAR TYPING INDICATOR (when no streaming) */}
                    {isTyping && !streamingText && !thinkingMessage && (
                      <div className="lex-message-row lex-assistant">
                        <div className="lex-message-avatar-wrapper">
                          <div className="lex-assistant-avatar">
                            <span className="lex-avatar-icon">⚖️</span>
                          </div>
                        </div>

                        <div className="lex-message-content-wrapper">
                          <div className="lex-message-sender-info">
                            <span className="lex-sender-name">
                              LEX AI Legal
                            </span>
                          </div>

                          <div className="lex-typing-indicator-modern">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* ===== INPUT AREA ===== */}
            <div className="lex-input-area-modern">
              <form onSubmit={handleSend} className="lex-input-form-modern">
                <div className="lex-input-wrapper">
                  <textarea
                    ref={inputRef}
                    className="lex-chat-textarea"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything about IPC, BNS, case law, or legal documentation..."
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />

                  <div className="lex-input-actions">
                    <button
                      type="submit"
                      className="lex-send-button"
                      disabled={!inputValue.trim() || isTyping}
                    >
                      <span className="lex-send-arrow">→</span>
                    </button>
                  </div>
                </div>

                <div className="lex-input-footer">
                  <span className="lex-model-disclaimer">
                    <span className="lex-footer-icon">⚖️</span>
                    LEX AI can make mistakes. Verify important legal information.
                  </span>
                  <span className="lex-shortcut-hint">
                    Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
                  </span>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}