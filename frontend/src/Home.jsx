import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Layout from "./Layout";
import "./Home.css";

export default function Home() {
  // ===== STATE - MINIMIZED UPDATES =====
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [activeThread, setActiveThread] = useState(null);
  
  // Chat state - isolated updates
  const [chatState, setChatState] = useState({
    activeCase: 0,
    retrievalStep: 0,
    queryText: "",
    isTyping: false
  });

  // ===== REFS - ALL CLEANUP =====
  const heroRef = useRef(null);
  const observerRef = useRef(null);
  const cursorRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const stepTimeoutsRef = useRef([]);
  const rafRef = useRef(null);
  const mountedRef = useRef(true);

  // ===== STATIC ASSETS - NEVER CHANGE =====
  const queries = useMemo(() => [
    "What is the punishment for theft under BNS?",
    "Difference between IPC 378 and BNS 303?",
    "Quantum of punishment for repeat offenders",
    "Bail conditions under new criminal laws"
  ], []);

  const pipelineStages = useMemo(() => [
    { id: 1, name: "Query Parse", icon: "🔍", time: "15ms" },
    { id: 2, name: "Vector Search", icon: "⚡", time: "45ms" },
    { id: 3, name: "Context Window", icon: "🧠", time: "30ms" },
    { id: 4, name: "Legal Reason", icon: "⚖️", time: "120ms" }
  ], []);

  const legalThreads = useMemo(() => [
    { id: "criminal", title: "Criminal Law", codes: ["IPC", "BNS", "CrPC", "BNSS"], volume: "2.4M" },
    { id: "civil", title: "Civil Procedure", codes: ["CPC", "Limitation"], volume: "1.8M" },
    { id: "constitutional", title: "Constitutional", codes: ["COI", "Writs"], volume: "950K" },
    { id: "corporate", title: "Corporate Law", codes: ["Companies", "IBC"], volume: "1.2M" }
  ], []);

  const metrics = useMemo(() => [
    { label: "Recall@10", value: "94.7", bar: 94.7 },
    { label: "Precision@5", value: "89.2", bar: 89.2 },
    { label: "NDCG@10", value: "91.8", bar: 91.8 },
    { label: "Section Map", value: "99.2", bar: 99.2 }
  ], []);

  // SVG Images - Completely static strings
  const ragImages = {
    query: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23000000'/%3E%3Ccircle cx='120' cy='150' r='40' fill='%23D4AF37' opacity='0.2'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%23D4AF37' opacity='0.3'/%3E%3Ccircle cx='280' cy='150' r='40' fill='%23D4AF37' opacity='0.2'/%3E%3Ctext x='160' y='160' fill='%23D4AF37' font-family='monospace' font-size='14'%3EIPC 378%3C/text%3E%3Ctext x='40' y='250' fill='%23ffffff' font-family='monospace' font-size='12'%3Etheft%3C/text%3E%3Ctext x='300' y='250' fill='%23ffffff' font-family='monospace' font-size='12'%3Eoffense%3C/text%3E%3C/svg%3E",
    retrieval: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23000000'/%3E%3Cpath d='M50,150 L350,150' stroke='%23D4AF37' stroke-width='1' opacity='0.3'/%3E%3Ccircle cx='80' cy='150' r='6' fill='%23D4AF37'/%3E%3Ccircle cx='150' cy='150' r='6' fill='%23D4AF37'/%3E%3Ccircle cx='220' cy='150' r='6' fill='%23D4AF37'/%3E%3Ccircle cx='290' cy='150' r='6' fill='%23D4AF37'/%3E%3Ctext x='70' y='100' fill='%23D4AF37' font-family='monospace' font-size='12'%3EBNS 303%3C/text%3E%3Ctext x='140' y='200' fill='%23D4AF37' font-family='monospace' font-size='12'%3EIPC 378%3C/text%3E%3Ctext x='210' y='80' fill='%23D4AF37' font-family='monospace' font-size='12'%3ECrPC 436%3C/text%3E%3Ctext x='280' y='180' fill='%23D4AF37' font-family='monospace' font-size='12'%3EBNS 305%3C/text%3E%3C/svg%3E",
    context: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23000000'/%3E%3Crect x='100' y='100' width='200' height='120' fill='none' stroke='%23D4AF37' stroke-width='1'/%3E%3Cline x1='100' y1='130' x2='300' y2='130' stroke='%23D4AF37' stroke-width='1' opacity='0.3'/%3E%3Ctext x='120' y='120' fill='%23D4AF37' font-family='monospace' font-size='10'%3EIPC 378%3C/text%3E%3Ctext x='120' y='150' fill='%23ffffff' font-family='monospace' font-size='10'%3ETheft definition...%3C/text%3E%3Ctext x='120' y='180' fill='%23ffffff' font-family='monospace' font-size='10'%3EPunishment: 3yrs%3C/text%3E%3C/svg%3E",
    reasoning: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23000000'/%3E%3Cpath d='M80,150 L150,80 L220,150 L290,80' stroke='%23D4AF37' stroke-width='2' fill='none'/%3E%3Ccircle cx='80' cy='150' r='4' fill='%23D4AF37'/%3E%3Ccircle cx='150' cy='80' r='4' fill='%23D4AF37'/%3E%3Ccircle cx='220' cy='150' r='4' fill='%23D4AF37'/%3E%3Ccircle cx='290' cy='80' r='4' fill='%23D4AF37'/%3E%3Ctext x='60' y='190' fill='%23ffffff' font-family='monospace' font-size='10'%3EIPC 378 → BNS 303%3C/text%3E%3C/svg%3E"
  };

  // Retrieved sections - Static
  const retrievedSections = [
    { code: "BNS 303", description: "Theft • Punishment up to 3 years", score: "0.98" },
    { code: "IPC 378", description: "Theft definition • Mapped to BNS 303", score: "0.95" },
    { code: "BNS 305", description: "Aggravated theft • Punishment up to 7 years", score: "0.87" }
  ];

  // ===== CURSOR - RAF OPTIMIZED =====
  useEffect(() => {
    mountedRef.current = true;
    
    const updateCursor = (e) => {
      if (!mountedRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      rafRef.current = requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        setCursorPos({ x: e.clientX, y: e.clientY });
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }
      });
    };

    window.addEventListener('mousemove', updateCursor, { passive: true });
    
    return () => {
      mountedRef.current = false;
      window.removeEventListener('mousemove', updateCursor);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ===== CHAT ANIMATION - ISOLATED, NO FLICKER =====
  useEffect(() => {
    mountedRef.current = true;
    
    const runChatCycle = () => {
      if (!mountedRef.current) return;
      
      const currentQuery = queries[chatState.activeCase];
      let charIndex = 0;
      
      // Reset state for new query
      setChatState(prev => ({
        ...prev,
        queryText: "",
        retrievalStep: 0,
        isTyping: true
      }));
      
      // Typing animation
      const typeNextChar = () => {
        if (!mountedRef.current) return;
        
        if (charIndex <= currentQuery.length) {
          setChatState(prev => ({
            ...prev,
            queryText: currentQuery.substring(0, charIndex),
            isTyping: true
          }));
          charIndex++;
          typingTimeoutRef.current = setTimeout(typeNextChar, 35);
        } else {
          setChatState(prev => ({ ...prev, isTyping: false }));
          
          // Clear any existing step timeouts
          stepTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
          stepTimeoutsRef.current = [];
          
          // Schedule RAG steps
          const steps = [
            setTimeout(() => {
              if (mountedRef.current) setChatState(prev => ({ ...prev, retrievalStep: 1 }));
            }, 800),
            setTimeout(() => {
              if (mountedRef.current) setChatState(prev => ({ ...prev, retrievalStep: 2 }));
            }, 1800),
            setTimeout(() => {
              if (mountedRef.current) setChatState(prev => ({ ...prev, retrievalStep: 3 }));
            }, 2800),
            setTimeout(() => {
              if (mountedRef.current) setChatState(prev => ({ ...prev, retrievalStep: 4 }));
            }, 3800),
            setTimeout(() => {
              if (mountedRef.current) {
                setChatState(prev => ({
                  ...prev,
                  activeCase: (prev.activeCase + 1) % queries.length
                }));
              }
            }, 7000)
          ];
          
          stepTimeoutsRef.current = steps;
        }
      };
      
      typingTimeoutRef.current = setTimeout(typeNextChar, 400);
    };
    
    runChatCycle();
    
    return () => {
      mountedRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stepTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      stepTimeoutsRef.current = [];
    };
  }, [chatState.activeCase, queries]);

  // ===== INTERSECTION OBSERVER - RAF OPTIMIZED =====
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              if (entry.target) {
                entry.target.classList.add('revealed');
              }
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observerRef.current?.observe(el));
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // ===== HANDLERS =====
  const handleThreadHover = useCallback((id) => {
    setActiveThread(id);
  }, []);

  const handleThreadLeave = useCallback(() => {
    setActiveThread(null);
  }, []);

  return (
    <Layout>
      <div className="legal-rag-home">
        
        {/* ===== CURSOR - STATIC POSITIONING ===== */}
        <div className="cursor-glow" ref={cursorRef} />
        <div 
          className="cursor-dot" 
          style={{ 
            transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
            opacity: cursorPos.x ? 1 : 0,
            willChange: 'transform'
          }} 
        />

        {/* ===== GRID OVERLAY ===== */}
        <div className="grid-overlay" />

        {/* ===== HERO - STATIC ===== */}
        <section className="hero-section" ref={heroRef}>
          <div className="container">
            <div className="hero-content reveal">
              <div className="status-badge">
                <span className="status-dot" />
                <span>DeepSeek Legal RAG • v2.0</span>
              </div>
              
              <h1 className="hero-title">
                <span className="title-line">Retrieve. Reason.</span>
                <span className="title-line gold">Respond.</span>
              </h1>
              
              <p className="hero-description">
                Legal assistant powered by retrieval-augmented generation. 
                Search 18.4M case documents, statutes, and precedents in milliseconds.
              </p>
              
              <div className="hero-actions">
                <button className="btn-gold">
                  <span>Try Legal Assistant →</span>
                  <div className="btn-glow" />
                </button>
                <button className="btn-outline">
                  <span>View API</span>
                </button>
              </div>

              <div className="trust-strip">
                <span>Trusted by Supreme Court</span>
                <span className="dot">•</span>
                <span>High Courts</span>
                <span className="dot">•</span>
                <span>Top 50 Law Firms</span>
              </div>
            </div>
          </div>
          
          <div className="hero-abstract">
            <div className="abstract-shape shape-1" />
            <div className="abstract-shape shape-2" />
            <div className="abstract-shape shape-3" />
          </div>
        </section>

        {/* ===== CHAT - ISOLATED RENDER ===== */}
        <section className="chat-section">
          <div className="chat-container">
            <div className="chat-header">
              <div className="chat-header-left">
                <span className="chat-icon">⚖️</span>
                <span className="chat-title">Legal Assistant • Real-time RAG</span>
              </div>
              <div className="chat-status">
                <span className="status-indicator" />
                <span>18.4M documents indexed</span>
              </div>
            </div>
            
            <div className="chat-conversation">
              {/* Query Message */}
              <div className="message-row user">
                <div className="message-avatar">U</div>
                <div className="message-bubble">
                  <div className="message-sender">You</div>
                  <div className="message-text">
                    {chatState.queryText}
                    {chatState.isTyping && <span className="cursor-blink">|</span>}
                  </div>
                </div>
              </div>

              {/* RAG Pipeline */}
              {chatState.retrievalStep > 0 && (
                <div className="message-row system">
                  <div className="message-avatar">⚙️</div>
                  <div className="message-bubble pipeline">
                    <div className="message-sender">RAG Pipeline</div>
                    <div className="pipeline-stages">
                      {pipelineStages.map((stage, index) => (
                        <div 
                          key={stage.id}
                          className={`pipeline-stage ${
                            index + 1 <= chatState.retrievalStep ? 'active' : ''
                          } ${index + 1 < chatState.retrievalStep ? 'completed' : ''}`}
                        >
                          <span className="stage-icon">{stage.icon}</span>
                          <span className="stage-name">{stage.name}</span>
                          <span className="stage-time">{stage.time}</span>
                          {index < pipelineStages.length - 1 && (
                            <span className="stage-connector">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Retrieved Sections */}
              {chatState.retrievalStep >= 3 && (
                <div className="message-row assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-bubble">
                    <div className="message-sender">DeepSeek Legal</div>
                    <div className="retrieved-chips">
                      {retrievedSections.map((section, idx) => (
                        <span key={idx} className="chip">
                          <span className="chip-code">{section.code}</span>
                          <span className="chip-score">{section.score}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Final Response */}
              {chatState.retrievalStep >= 4 && (
                <div className="message-row assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-bubble response">
                    <div className="message-sender">Legal Reasoning</div>
                    <div className="response-text">
                      Under the Bharatiya Nyaya Sanhita, theft is defined in Section 303, which corresponds to IPC Section 378. The punishment for theft under BNS 303 is imprisonment up to 3 years or fine, or both. For repeat offenders, Section 305 provides enhanced punishment up to 7 years.
                    </div>
                    <div className="response-footer">
                      <span>Based on 3 retrieved sections</span>
                      <span className="confidence">94.2% confidence</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-area">
              <span className="input-prompt">→</span>
              <span className="input-placeholder">Ask a legal question...</span>
              <span className="input-shortcut">/</span>
            </div>
          </div>
        </section>

        {/* ===== PIPELINE FLOW - STATIC IMAGES ===== */}
        <section className="pipeline-section">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-badge">RETRIEVAL-AUGMENTED GENERATION</span>
              <h2>How legal RAG works</h2>
              <p>Multi-stage retrieval with neural reranking and legal reasoning</p>
            </div>

            <div className="pipeline-flow">
              {Object.entries(ragImages).map(([key, src], index) => (
                <div key={key} className="flow-node reveal">
                  <div className="flow-visual">
                    <img 
                      src={src} 
                      alt={key}
                      className="flow-svg"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flow-glow" />
                  </div>
                  <div className="flow-meta">
                    <span className="flow-icon">{pipelineStages[index].icon}</span>
                    <span className="flow-title">{pipelineStages[index].name}</span>
                    <span className="flow-time">{pipelineStages[index].time}</span>
                  </div>
                  {index < 3 && <div className="flow-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== THREADS TIMELINE ===== */}
        <section className="threads-section">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-badge">SPECIALIZED KNOWLEDGE BASES</span>
              <h2>Embeded  <span className="gold">400+</span> legal sections</h2>
              <p>Domain-specific retrieval with continuous learning</p>
            </div>

            <div className="threads-timeline">
              {legalThreads.map((thread, index) => (
                <div 
                  key={thread.id} 
                  className={`thread-item reveal ${activeThread === thread.id ? 'active' : ''}`}
                  onMouseEnter={() => handleThreadHover(thread.id)}
                  onMouseLeave={handleThreadLeave}
                >
                  <div className="thread-marker">
                    <span className="thread-dot" />
                    <span className="thread-line" />
                  </div>
                  <div className="thread-content">
                    <div className="thread-header">
                      <h3>{thread.title}</h3>
                      <span className="thread-volume">{thread.volume}</span>
                    </div>
                    <div className="thread-codes">
                      {thread.codes.map(code => (
                        <span key={code} className="code-tag">{code}</span>
                      ))}
                    </div>
                    <div className="thread-stats">
                      <span>Indexed precedents</span>
                      <span className="thread-arrow">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== METRICS ===== */}
        <section className="metrics-section">
          <div className="container">
            <div className="metrics-grid">
              <div className="metrics-left reveal">
                <span className="section-badge">BENCHMARKS</span>
                <h2>State-of-the-art retrieval accuracy</h2>
                <div className="metric-chain">
                  {metrics.map((metric, idx) => (
                    <div key={metric.label} className="chain-link">
                      <div className="chain-header">
                        <span className="chain-label">{metric.label}</span>
                        <span className="chain-value">{metric.value}%</span>
                      </div>
                      <div className="chain-bar">
                        <div 
                          className="chain-progress" 
                          style={{ width: `${metric.bar}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="metrics-right reveal">
                <div className="stats-cluster">
                  <div className="stat-sphere">
                    <span className="sphere-number">18.4M</span>
                    <span className="sphere-label">Documents</span>
                  </div>
                  <div className="stat-sphere">
                    <span className="sphere-number">1M</span>
                    <span className="sphere-label">Token context</span>
                  </div>
                  <div className="stat-sphere">
                    <span className="sphere-number">99.99%</span>
                    <span className="sphere-label">Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content reveal">
              <h2>Build with the most accurate<br />legal retrieval system</h2>
              <p>Get API access to our RAG pipeline trained on Indian legal documents</p>
              <div className="cta-actions">
                <button className="btn-gold btn-large">
                  <span>Start retrieving →</span>
                </button>
                <button className="btn-outline btn-large">
                  <span>Read documentation</span>
                </button>
              </div>
              <div className="cta-features">
                <span>✓ 18.4M document index</span>
                <span>✓ 1M token context</span>
                <span>✓ 99.99% uptime</span>
                <span>✓ Section mapping</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="legal-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <span className="footer-logo">DEEPSEEK LEGAL</span>
                <span className="footer-tag">Retrieval-Augmented Legal Intelligence</span>
              </div>
              <div className="footer-links">
                <a href="#">RAG Pipeline</a>
                <a href="#">Section Mapper</a>
                <a href="#">API</a>
                <a href="#">Docs</a>
              </div>
              <div className="footer-meta">
                <span>© 2026 DeepSeek</span>
                <span className="divider">•</span>
                <span>18.4M indexed</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}