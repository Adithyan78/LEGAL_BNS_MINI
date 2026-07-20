import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

/* ================================================================
   SVG ICON COMPONENTS
   ================================================================ */

const ScalesIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M3 6l4.5 9M3 6h18M20.5 15l-4.5-9M7.5 15h9M3 21h18" />
    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const ChevronIcon = ({ expanded, className = "" }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""} ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckDoneIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SendIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const StopIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MenuIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LogOutIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);


/* ================================================================
   LEGAL RESPONSE RENDERER
   ================================================================ */

function LegalResponseRenderer({ text }) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  /* ---------- Strip inline markdown the model tends to emit ---------- */
  const stripMarkdownLine = (line) =>
    line
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/^#{1,6}\s*/, "")
      .trim();

  /* ---------- Parse structured response ---------- */
  const parseSections = (input) => {
    const lines = input.split("\n");
    const sections = [];
    let current = null;
    let conclusion = null;
    let mode = null;

    lines.forEach((line) => {
      const trimmed = stripMarkdownLine(line);
      if (!trimmed) return;

      if (trimmed.includes("APPLICABLE SECTION")) {
        if (current) sections.push(current);
        current = {
          title: trimmed,
          sectionId: trimmed.match(/(?:BNS|SECTION)[\s_]*\d+(?:\s*\(\d+\))?/i)?.[0]?.replace(/_/g, " ") || trimmed,
          definition: "",
          ingredients: "",
          reasoning: "",
          punishment: "",
          facts: "",
          ipc_changes: "",
        };
        mode = null;
      } else if (trimmed.includes("SECTION DEFINITION")) {
        mode = "definition";
      } else if (trimmed.includes("ESSENTIAL INGREDIENTS")) {
        mode = "ingredients";
      } else if (trimmed.includes("CASE FACTS ANALYSIS")) {
        mode = "facts";
      } else if (trimmed.includes("LEGAL REASONING")) {
        mode = "reasoning";
      } else if (trimmed.includes("PRESCRIBED PUNISHMENT")) {
        mode = "punishment";
      } else if (trimmed.includes("IPC EQUIVALENT")) {
        mode = "ipc_changes";
      } else if (trimmed.includes("FINAL LEGAL CONCLUSION")) {
        if (current) sections.push(current);
        conclusion = { title: trimmed, content: "" };
        mode = "conclusion";
      } else if (mode === "conclusion") {
        conclusion.content += `${trimmed}\n`;
      } else if (current && mode) {
        current[mode] += `${trimmed}\n`;
      }
    });

    if (current) sections.push(current);
    if (conclusion) sections.push(conclusion);

    const seen = new Set();
    return sections.filter((section) => {
      const key = section.title?.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const sections = parseSections(text);

  /* ---------- Fallback: model didn't use the expected section format ---------- */
  if (sections.length === 0) {
    return (
      <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
        {text}
      </div>
    );
  }

  // Count applicable sections (not conclusion) to decide default expand state
  const applicableSectionCount = sections.filter((s) => s.content === undefined).length;
  const defaultExpanded = applicableSectionCount <= 2;

  /* ---------- Render a sub-block within a section ---------- */
  const renderSubBlock = (label, content, isList = false, isMuted = false) => {
    if (!content?.trim()) return null;

    return (
      <div className={`mt-4 ${isMuted ? "border-l-2 border-slate-200 pl-4" : ""}`}>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isMuted ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </p>
        <div className={`mt-2 whitespace-pre-line text-sm leading-7 ${isMuted ? "text-slate-500" : "text-slate-700"}`}>
          {isList ? (
            content.trim().split("\n").filter(Boolean).map((line, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <CheckIcon className="w-4 h-4 text-[#B8860B] mt-1.5 shrink-0" />
                <span>{line.replace(/^(?:[-•✓✔]|\d+[.)])\s*/, "")}</span>
              </div>
            ))
          ) : (
            content.trim()
          )}
        </div>
      </div>
    );
  };

  /* ---------- Render ---------- */
  return (
    <div className="space-y-3 mt-4">
      {sections.map((section, index) => {
        /* ----- Final Conclusion ----- */
        if (section.content !== undefined) {
          return (
            <div
              key={index}
              className="mt-6 border-t border-amber-200 bg-amber-50/50 rounded-xl p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B8860B]">
                Final Legal Conclusion
              </p>
              <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-800 font-medium">
                {section.content}
              </div>
            </div>
          );
        }

        /* ----- Applicable Section (collapsible) ----- */
        const expanded = expandedSections[index] ?? defaultExpanded;

        return (
          <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50/80 transition-colors"
              onClick={() => toggleSection(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSection(index);
                }
              }}
              aria-expanded={expanded}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Applicable Section
                </p>
                <h3
                  className="mt-1 text-base font-semibold text-[#0F172A]"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {section.sectionId || section.title}
                </h3>
              </div>
              <ChevronIcon expanded={expanded} className="text-slate-400" />
            </button>

            {expanded && (
              <div className="px-5 pb-5 border-t border-slate-100">
                {renderSubBlock("Section Definition", section.definition)}
                {renderSubBlock("Essential Ingredients", section.ingredients, true)}
                {renderSubBlock("Case Facts Analysis", section.facts, true)}
                {renderSubBlock("Legal Reasoning", section.reasoning)}
                {renderSubBlock("Prescribed Punishment", section.punishment)}
                {renderSubBlock("IPC Equivalent & Changes", section.ipc_changes, false, true)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ================================================================
   MAIN CHATBOT COMPONENT
   ================================================================ */

export default function Chatbot() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* ---------- State ---------- */
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(uuidv4());
  const [chatList, setChatList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState("New Case");
  const [copiedId, setCopiedId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  /* ---------- Refs ---------- */
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const abortControllerRef = useRef(null);

  /* ---------- Suggested prompts ---------- */
  const suggestedPrompts = [
    {
      label: "Theft & robbery",
      prompt: "A shopkeeper caught two men stealing electronics worth ₹50,000 from his store at night. They threatened him with a knife when confronted.",
    },
    {
      label: "Domestic violence",
      prompt: "A woman has been physically assaulted by her husband repeatedly over 3 years. She has medical records and witness testimony from neighbors.",
    },
    {
      label: "Fraud & cheating",
      prompt: "A real estate developer collected ₹2 crore from 15 buyers for flats, issued fake allotment letters, but never started construction and is now absconding.",
    },
  ];

  /* ---------- Thinking messages ---------- */
  const thinkingMessages = [
    "Reviewing case details…",
    "Searching BNS provisions…",
    "Analyzing legal framework…",
    "Cross-referencing sections…",
    "Formulating analysis…",
  ];

  /* ================================================================
     AUTO-SCROLL MANAGEMENT
     ================================================================ */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldAutoScroll.current = distanceFromBottom <= 5;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (shouldAutoScroll.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, streamingText, thinkingMessage]);

  /* ================================================================
     FETCH / SAVE / LOAD / DELETE CHATS — UNCHANGED API LOGIC
     ================================================================ */
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
            updatedMessages[0]?.text?.substring(0, 40) || "New Conversation",
        }),
      });
      fetchChats();
    } catch (error) {
      console.error("Failed to save chat:", error);
    }
  };

  const loadChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatId(id);
      setMessages(data.messages);
      setCaseTitle(data.title || "Loaded Case");
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

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

  /* ================================================================
     NEW CHAT
     ================================================================ */
  const newChat = () => {
    setChatId(uuidv4());
    setMessages([]);
    setInputValue("");
    setStreamingText("");
    setThinkingMessage("");
    setCaseTitle("New Case");
    setIsSidebarOpen(false);
  };

  /* ================================================================
     THINKING ANIMATION
     ================================================================ */
  const startThinking = () => {
    let index = 0;
    setThinkingMessage(thinkingMessages[0]);
    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % thinkingMessages.length;
      setThinkingMessage(thinkingMessages[index]);
    }, 2500);
  };

  const stopThinking = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
    setThinkingMessage("");
  };

  /* ================================================================
     STREAMING SUPPORT — SIMULATED (FALLBACK)
     ================================================================ */
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
    setCaseTitle(messageText.substring(0, 40));
    startThinking();

    try {
      const response = await fetch("http://localhost:4000/api/analyze-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ case_description: userMsg.text }),
      });

      const data = await response.json();
      stopThinking();

      const fullText = data.analysis || "I couldn't find a BNS section that clearly applies to this case based on the details provided. Could you provide more specific facts or context?";
      let currentIndex = 0;

      const streamInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          const chunkSize = Math.floor(Math.random() * 4) + 2;
          const chunk = fullText.slice(currentIndex, currentIndex + chunkSize);
          currentIndex += chunkSize;
          setStreamingText((prev) => prev + chunk);
        } else {
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
      }, 30);
    } catch (error) {
      console.error("AI Error:", error);
      stopThinking();

      const errorMsg = {
        id: Date.now() + 1,
        text: "I encountered an issue connecting to the analysis service. Please try again in a moment.",
        sender: "assistant",
        timestamp: new Date(),
        isError: true,
      };

      setMessages([...updatedMessages, errorMsg]);
      setStreamingText("");
      setIsTyping(false);
    }
  };

  /* ================================================================
     REAL STREAMING
     ================================================================ */
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
    setCaseTitle(messageText.substring(0, 40));
    startThinking();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        "http://localhost:4000/api/analyze-case-stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ case_description: userMsg.text }),
          signal: controller.signal,
        }
      );

      stopThinking();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
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
          abortControllerRef.current = null;
          saveChat(finalMessages);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setStreamingText(accumulatedText);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        // User stopped generation
        const assistantMsg = {
          id: Date.now() + 1,
          text: streamingText || "Generation stopped.",
          sender: "assistant",
          timestamp: new Date(),
        };
        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);
        setStreamingText("");
        setIsTyping(false);
        abortControllerRef.current = null;
        saveChat(finalMessages);
        return;
      }

      console.error("Streaming Error:", error);
      stopThinking();
      handleSendWithStreaming(null, messageText);
    }
  };

  const handleSend = handleSendWithRealStreaming;

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  /* ================================================================
     PROMPT CLICK
     ================================================================ */
  const handlePromptClick = (prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  /* ================================================================
     COPY MESSAGE
     ================================================================ */
  const handleCopyMessage = useCallback(async (text, msgId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, []);

  /* ================================================================
     LOGOUT
     ================================================================ */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  /* ================================================================
     TIME FORMAT
     ================================================================ */
  const formatTimestamp = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return "Yesterday";
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return d.toLocaleDateString();
  };

  /* ================================================================
     TEXTAREA AUTO-RESIZE
     ================================================================ */
  const handleTextareaChange = (e) => {
    setInputValue(e.target.value);
    // Reset height to auto to recalculate
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  /* ================================================================
     RENDER — FULL VIEWPORT APP SHELL
     ================================================================ */
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">

      {/* ============ MOBILE SIDEBAR BACKDROP ============ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============ LEFT SIDEBAR ============ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-[#F4F4F5] border-r border-slate-200
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ---- Logo / App Name ---- */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F172A] text-white">
            <ScalesIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wider text-[#0F172A]">LEX AI</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">BNS Research</div>
          </div>
        </div>

        {/* ---- New Case Button ---- */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E3A5F]"
          >
            <PlusIcon className="w-4 h-4" />
            New Case
          </button>
        </div>

        {/* ---- Chat List ---- */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar px-3 pb-3">
          <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Recent Cases
          </p>
          <div className="space-y-0.5">
            {chatList.length > 0 ? (
              chatList.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`
                    group flex items-center rounded-lg transition-colors cursor-pointer
                    ${chatId === chat.chatId
                      ? "bg-[#1E3A5F] text-white border-l-2 border-[#B8860B]"
                      : "text-slate-600 hover:bg-slate-200/60"
                    }
                  `}
                >
                  <button
                    type="button"
                    className="flex-1 px-3 py-2.5 text-left min-w-0"
                    onClick={() => loadChat(chat.chatId)}
                  >
                    <p className="text-sm font-medium truncate">
                      {chat.title || "Untitled"}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${chatId === chat.chatId ? "text-slate-300" : "text-slate-400"}`}>
                      {formatTimestamp(chat.updatedAt || chat.createdAt)}
                    </p>
                  </button>
                  <button
                    type="button"
                    className={`
                      p-1.5 mr-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                      ${chatId === chat.chatId ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-slate-700"}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.chatId);
                    }}
                    title="Delete conversation"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="px-2 py-4 text-xs text-slate-400 text-center">
                No prior cases yet
              </p>
            )}
          </div>
        </div>

        {/* ---- Bottom User Area ---- */}
        <div className="border-t border-slate-200 px-4 py-3 relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-200/60 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold text-slate-600">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">Account</p>
            </div>
            <SettingsIcon className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <LogOutIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============ MAIN PANEL ============ */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* ---- Top Bar ---- */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors md:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1
              className="text-base font-semibold text-[#0F172A] truncate cursor-text"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setCaseTitle(e.target.textContent || "New Case")}
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", outline: "none" }}
            >
              {caseTitle}
            </h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">
              BNS / IPC Analysis
            </p>
          </div>
        </header>

        {/* ---- Message Area ---- */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto chat-scrollbar"
        >
          {messages.length === 0 && !streamingText && !thinkingMessage ? (
            /* ======== EMPTY STATE ======== */
            <div className="flex h-full items-center justify-center px-4">
              <div className="max-w-lg text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A]/5 text-[#0F172A]">
                  <ScalesIcon className="w-7 h-7" />
                </div>
                <h2
                  className="mt-5 text-2xl font-semibold text-[#0F172A]"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  What case would you like analyzed?
                </h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Describe the facts and circumstances. I'll identify applicable BNS sections with structured legal reasoning.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => handlePromptClick(sp.prompt)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:border-[#B8860B]/40 hover:bg-amber-50/50 hover:text-slate-800"
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ======== MESSAGES ======== */
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6 md:px-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.sender === "user" ? (
                    /* ---- User Message ---- */
                    <div className="flex justify-end">
                      <div className="max-w-[70%] rounded-2xl bg-slate-100 px-4 py-3">
                        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ---- Assistant Message ---- */
                    <div className="group relative">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F172A] text-white">
                          <ScalesIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {msg.isError ? (
                            <div className="flex items-start gap-2 text-sm text-slate-500">
                              <svg className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <p className="leading-relaxed">{msg.text}</p>
                            </div>
                          ) : (
                            <LegalResponseRenderer text={msg.text} />
                          )}
                        </div>
                      </div>

                      {/* Copy button (shown on hover) */}
                      {!msg.isError && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, msg.id)}
                          className="absolute top-0 right-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-slate-500 hover:bg-slate-100"
                          title="Copy analysis"
                        >
                          {copiedId === msg.id ? (
                            <CheckDoneIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <CopyIcon className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* ---- Thinking Indicator ---- */}
              {thinkingMessage && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F172A] text-white">
                    <ScalesIcon className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-400 animate-gentle-pulse pt-1">
                    {thinkingMessage}
                  </p>
                </div>
              )}

              {/* ---- Streaming Response ---- */}
              {streamingText && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F172A] text-white">
                    <ScalesIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-pre-line text-sm leading-7 text-slate-700">
                      {streamingText}
                      <span className="ml-0.5 inline-block w-[2px] h-4 bg-[#B8860B] align-middle animate-cursor-blink" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ---- Composer / Input Bar ---- */}
        <div className="border-t border-slate-100 bg-[#FAFAF9] px-4 py-3 md:px-6">
          <form
            onSubmit={handleSend}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:border-slate-300">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleTextareaChange}
                rows={1}
                placeholder="Describe the case…"
                className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
                style={{ maxHeight: "200px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isTyping && inputValue.trim()) {
                      handleSend(e);
                    }
                  }
                }}
                disabled={isTyping}
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Enter to send · Shift+Enter for new line
                </p>
                <div className="ml-auto">
                  {isTyping ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300"
                      title="Stop generating"
                    >
                      <StopIcon className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-lg transition-colors
                        ${inputValue.trim()
                          ? "bg-[#B8860B] text-white hover:bg-[#9a7209]"
                          : "bg-slate-100 text-slate-300 cursor-not-allowed"
                        }
                      `}
                      title="Send message"
                    >
                      <SendIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
          <p className="mx-auto max-w-3xl mt-2 text-center text-[10px] text-slate-400">
            This analysis is based solely on the facts provided and should be verified independently.
          </p>
        </div>
      </div>
    </div>
  );
}