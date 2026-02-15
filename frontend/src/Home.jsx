import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import "./Home.css";

export default function Home() {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <Layout>
      <div className="legal-rag-home">
        
        {/* ===== HERO ===== */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content reveal">
              <div className="status-badge">
                <span className="status-dot"></span>
                <span>Research Project • Active Development</span>
              </div>
              
              <h1 className="hero-title">
                <span className="title-line">BNS legal research</span>
                <span className="title-line accent shimmer-text">with semantic search</span>
              </h1>
              
              <p className="hero-description">
                A retrieval-augmented generation system for Bharatiya Nyaya Sanhita. 
                Query in natural language and get relevant sections with IPC mappings 
                and contextual explanations.
              </p>
              
              <div className="hero-actions">
                <Link to="/chatbot" className="btn-primary">
                  Try Demo
                </Link>
                <a href="#about" className="btn-secondary">
                  Learn More
                </a>
              </div>
              
              <p className="hero-note">
                Research prototype • Not for legal advice
              </p>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="how-it-works-section" id="about">
          <div className="container">
            <div className="section-intro reveal">
              <div className="section-label">How it Works</div>
              <h2>
                Simple <span className="accent">RAG pipeline</span>
              </h2>
              <p>
                Four-step process to retrieve and reason over legal sections
              </p>
            </div>

            <div className="pipeline-flow">
              <div className="flow-step reveal">
                <div className="step-marker">
                  <div className="step-number">1</div>
                </div>
                <div className="step-content">
                  <h3>User Query</h3>
                  <p>
                    You input a legal query in natural language. For example: "What is the 
                    punishment for theft under BNS?" or "Find sections related to criminal 
                    intimidation."
                  </p>
                </div>
              </div>

              <div className="flow-step reveal">
                <div className="step-marker">
                  <div className="step-number">2</div>
                </div>
                <div className="step-content">
                  <h3>Semantic Search</h3>
                  <p>
                    The system converts your query into embeddings and searches the BNS 
                    knowledge base for semantically similar sections. Retrieves the top-k 
                    most relevant sections based on similarity scores.
                  </p>
                </div>
              </div>

              <div className="flow-step reveal">
                <div className="step-marker">
                  <div className="step-number">3</div>
                </div>
                <div className="step-content">
                  <h3>LLM Processing</h3>
                  <p>
                    Retrieved sections are passed to a language model which identifies the 
                    most relevant provisions for your specific query and filters out less 
                    relevant results.
                  </p>
                </div>
              </div>

              <div className="flow-step reveal">
                <div className="step-marker">
                  <div className="step-number">4</div>
                </div>
                <div className="step-content">
                  <h3>Response Generation</h3>
                  <p>
                    The LLM generates a clear explanation with the relevant BNS sections, 
                    corresponding IPC mappings, legal reasoning, and contextual information 
                    to answer your query.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== KNOWLEDGE BASE ===== */}
        <section className="knowledge-base-section">
          <div className="container">
            <div className="section-intro reveal">
              <div className="section-label">Knowledge Base</div>
              <h2>
                What's <span className="accent">included</span>
              </h2>
              <p>
                Comprehensive coverage of BNS with ongoing expansions
              </p>
            </div>

            <div className="knowledge-content">
              <div className="knowledge-list">
                
                {/* BNS SECTIONS */}
                <div className="knowledge-item reveal">
                  <div className="knowledge-sidebar">
                    <div className="knowledge-status-badge">
                      <span className="status-indicator-dot"></span>
                      Available
                    </div>
                    <span className="knowledge-icon-large">📚</span>
                  </div>
                  
                  <div className="knowledge-main">
                    <h3>Bharatiya Nyaya Sanhita Sections</h3>
                    <p className="knowledge-summary">
                      Complete statutory text of all BNS sections organized by chapters and 
                      offense categories. Each section includes the official provision text, 
                      explanations, illustrations, and exceptions where applicable.
                    </p>

                    <div className="knowledge-stats">
                      <div className="stat-item">
                        <span className="stat-number">358</span>
                        <span className="stat-text">Total sections indexed</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">20</span>
                        <span className="stat-text">Chapters covering offenses</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">100%</span>
                        <span className="stat-text">Coverage of BNS 2023</span>
                      </div>
                    </div>

                    <div className="knowledge-features">
                      <h4>What's Included</h4>
                      <div className="feature-list">
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Full statutory text</strong> for every section with official 
                            numbering and subsections
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Section explanations</strong> and clarifications provided in 
                            the statute where applicable
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Statutory illustrations</strong> and examples demonstrating 
                            application of provisions
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Exception clauses</strong> and provisos that modify or limit 
                            the main provision
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Punishment details</strong> including imprisonment terms, fines, 
                            and cognizability status
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Chapter organization</strong> from general principles to 
                            specific offenses
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="knowledge-examples">
                      <h5>Example Sections</h5>
                      <div className="example-list">
                        <div className="example-item">BNS 303 - Punishment for theft</div>
                        <div className="example-item">BNS 351 - Criminal breach of trust</div>
                        <div className="example-item">BNS 103 - Murder</div>
                        <div className="example-item">BNS 115 - Voluntarily causing hurt</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IPC MAPPING */}
                <div className="knowledge-item reveal">
                  <div className="knowledge-sidebar">
                    <div className="knowledge-status-badge">
                      <span className="status-indicator-dot"></span>
                      Available
                    </div>
                    <span className="knowledge-icon-large">🔗</span>
                  </div>
                  
                  <div className="knowledge-main">
                    <h3>IPC to BNS Section Mapping</h3>
                    <p className="knowledge-summary">
                      Comprehensive bidirectional mapping between Indian Penal Code sections 
                      and their corresponding Bharatiya Nyaya Sanhita provisions. Helps navigate 
                      the transition from the old to new criminal code.
                    </p>

                    <div className="knowledge-stats">
                      <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-text">IPC sections mapped</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">358</span>
                        <span className="stat-text">BNS provisions linked</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">Both</span>
                        <span className="stat-text">Directions supported</span>
                      </div>
                    </div>

                    <div className="knowledge-features">
                      <h4>Mapping Features</h4>
                      <div className="feature-list">
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Bidirectional lookup</strong> - search by IPC section to find 
                            BNS equivalent or vice versa
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Change tracking</strong> - identifies what was modified, added, 
                            or removed in BNS
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Structural changes</strong> - notes when sections were split, 
                            merged, or reorganized
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>New offenses</strong> - highlights provisions introduced in BNS 
                            with no IPC predecessor
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span className="feature-text">
                            <strong>Deleted sections</strong> - shows IPC sections not carried 
                            forward to BNS
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="knowledge-examples">
                      <h5>Example Mappings</h5>
                      <div className="example-list">
                        <div className="example-item">IPC 378 ↔ BNS 303 (Theft)</div>
                        <div className="example-item">IPC 420 ↔ BNS 318 (Cheating)</div>
                        <div className="example-item">IPC 302 ↔ BNS 103 (Murder)</div>
                        <div className="example-item">IPC 379 ↔ BNS 303(1) (Theft punishment)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CASE SUMMARIES */}
                <div className="knowledge-item reveal">
                  <div className="knowledge-sidebar">
                    <div className="knowledge-status-badge coming-soon">
                      <span className="status-indicator-dot"></span>
                      In Progress
                    </div>
                    <span className="knowledge-icon-large">⚖️</span>
                  </div>
                  
                  <div className="knowledge-main">
                    <h3>Case Law Summaries</h3>
                    <p className="knowledge-summary">
                      Curated summaries of Supreme Court and High Court judgments relevant to 
                      BNS provisions. Provides judicial interpretation and application context 
                      for statutory sections.
                    </p>

                    <div className="knowledge-stats">
                      <div className="stat-item">
                        <span className="stat-number">—</span>
                        <span className="stat-text">Cases being added</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">SC+HC</span>
                        <span className="stat-text">Court coverage</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">Link</span>
                        <span className="stat-text">To relevant sections</span>
                      </div>
                    </div>

                    <div className="knowledge-features">
                      <h4>Planned Coverage</h4>
                      <div className="feature-list">
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Landmark judgments</strong> from Supreme Court establishing 
                            legal principles
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Case summaries</strong> with key facts, legal issues, and 
                            holdings extracted
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Section-wise linking</strong> - cases tagged to specific BNS/IPC 
                            provisions discussed
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Legal principles</strong> - ratio decidendi and key 
                            interpretations highlighted
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Precedent relevance</strong> - assessment of which IPC precedents 
                            apply to BNS
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="coming-soon-note">
                      <p>
                        Currently being compiled and structured for integration. Initial focus on 
                        Supreme Court landmark cases for commonly queried offenses like theft, 
                        cheating, criminal breach of trust, and violent crimes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PRECEDENT ANALYSIS */}
                <div className="knowledge-item reveal">
                  <div className="knowledge-sidebar">
                    <div className="knowledge-status-badge coming-soon">
                      <span className="status-indicator-dot"></span>
                      Planned
                    </div>
                    <span className="knowledge-icon-large">📊</span>
                  </div>
                  
                  <div className="knowledge-main">
                    <h3>Precedent & Sentencing Analysis</h3>
                    <p className="knowledge-summary">
                      Analysis of judicial trends including sentencing patterns, bail considerations, 
                      and how courts have interpreted specific provisions over time. Provides practical 
                      guidance beyond statutory text.
                    </p>

                    <div className="knowledge-stats">
                      <div className="stat-item">
                        <span className="stat-number">—</span>
                        <span className="stat-text">Future release</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">Multi</span>
                        <span className="stat-text">Analysis types</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">Data</span>
                        <span className="stat-text">Driven insights</span>
                      </div>
                    </div>

                    <div className="knowledge-features">
                      <h4>Future Features</h4>
                      <div className="feature-list">
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Sentencing patterns</strong> - typical ranges and aggravating/
                            mitigating factors considered
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Bail jurisprudence</strong> - when bail is typically granted or 
                            denied for offense types
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Essential ingredients</strong> - what prosecution must prove for 
                            each offense category
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Defenses and exceptions</strong> - common legal defenses raised 
                            and their success rates
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">○</span>
                          <span className="feature-text">
                            <strong>Interpretation trends</strong> - how judicial approach to certain 
                            provisions has evolved
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="coming-soon-note">
                      <p>
                        Planned for future development after case law database reaches sufficient 
                        size. Will require significant data collection and analysis infrastructure.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ===== MAPPING ===== */}
        <section className="mapping-section">
          <div className="container">
            <div className="section-intro reveal">
              <div className="section-label">Section Mapping</div>
              <h2>
                IPC to BNS <span className="accent">transition</span>
              </h2>
              <p>
                Navigate between old and new criminal codes seamlessly
              </p>
            </div>

            <div className="mapping-content">
              <div className="mapping-visual reveal">
                <div className="mapping-example">
                  <div className="code-box">
                    <div className="code-label">Indian Penal Code</div>
                    <div className="code-number">IPC 378</div>
                  </div>
                  <div className="mapping-arrow">↕</div>
                  <div className="code-box">
                    <div className="code-label">Bharatiya Nyaya Sanhita</div>
                    <div className="code-number">BNS 303</div>
                  </div>
                </div>
              </div>

              <div className="mapping-details reveal">
                <h3>Automatic Mapping</h3>
                <div className="mapping-features">
                  <div className="mapping-feature">
                    <span className="mapping-feature-text">
                      Query using familiar IPC section numbers and get corresponding 
                      BNS provisions
                    </span>
                  </div>
                  <div className="mapping-feature">
                    <span className="mapping-feature-text">
                      Understand what changed between IPC and BNS for each offense
                    </span>
                  </div>
                  <div className="mapping-feature">
                    <span className="mapping-feature-text">
                      Navigate bidirectionally between old and new code sections
                    </span>
                  </div>
                  <div className="mapping-feature">
                    <span className="mapping-feature-text">
                      Identify new offenses introduced in BNS with no IPC equivalent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section className="about-section">
          <div className="container">
            <div className="section-intro reveal">
              <div className="section-label">About</div>
              <h2>
                Research <span className="accent">prototype</span>
              </h2>
            </div>

            <div className="about-content reveal">
              <p className="about-text">
                This is a research project exploring retrieval-augmented generation for legal 
                information retrieval. The system uses semantic search to find relevant BNS 
                sections based on natural language queries, then uses a language model to 
                provide contextual explanations and reasoning.
              </p>

              <div className="tech-stack">
                <h4>Technical Approach</h4>
                <div className="tech-list">
                  <div className="tech-item">
                    RAG (Retrieval-Augmented Generation) architecture
                  </div>
                  <div className="tech-item">
                    Semantic search using embedding models for section retrieval
                  </div>
                  <div className="tech-item">
                    LLM-based filtering and response generation
                  </div>
                  <div className="tech-item">
                    Knowledge base of BNS sections with IPC mappings
                  </div>
                  <div className="tech-item">
                    Ongoing integration of case summaries and precedents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="cta-section" id="demo">
          <div className="container">
            <div className="cta-content reveal">
              <h2>Try the system</h2>
              <p>
                Explore BNS sections through natural language queries and see 
                how RAG can assist with legal research.
              </p>
              <div className="cta-actions">
                <Link to="/chatbot" className="btn-primary">
                  Access Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="legal-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="footer-logo">LexAI</div>
                <div className="footer-tag">Legal Research Prototype</div>
              </div>
              <div className="footer-links">
                <a href="/chatbot">Demo</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-meta">
                <span>© 2026</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}