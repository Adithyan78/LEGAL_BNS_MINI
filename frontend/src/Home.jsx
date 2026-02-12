import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "./Layout";
import "./Home.css";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ accuracy: 0, cases: 0, uptime: 0 });
  
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const observerRef = useRef(null);
  const carouselRef = useRef(null);
  const animationRef = useRef(null);

  // ===== PARTICLE SYSTEM =====
  const particles = useRef(
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.15 + 0.05,
      opacity: Math.random() * 0.2 + 0.1,
    }))
  );

  // ===== HORIZONTAL BANNER CAROUSEL - ULTRA SLOW =====

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    let scrollPosition = 0;
    
    const animate = () => {
      scrollPosition += 0.005;    // <--- EXTREMELY SLOW - 100 seconds per cycle
      
      if (scrollPosition >= 50) {
        scrollPosition = 0;
      }
      carousel.style.transform = `translateX(-${scrollPosition}%)`;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ===== COUNTING ANIMATION =====
  const startCounting = useCallback(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      
      setCounts({
        accuracy: Math.floor(99.2 * progress),
        cases: Math.floor(5000 * progress),
        uptime: Math.floor(99.9 * progress)
      });

      if (progress === 1) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // ===== INTERSECTION OBSERVER =====
  useEffect(() => {
    setIsVisible(true);
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            
            if (entry.target.classList.contains("stats-hologram")) {
              startCounting();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const observer = observerRef.current;

    if (statsRef.current) observer.observe(statsRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, [startCounting]);

  // ===== 3D TILT EFFECT =====
  const handleMouseMove = useCallback((e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    
    card.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      translateY(-5px)
    `;
  }, []);

  const handleMouseLeave = useCallback((card) => {
    card.style.transform = `
      perspective(1000px) 
      rotateX(0deg) 
      rotateY(0deg) 
      translateY(0px)
    `;
  }, []);

  // ===== FEATURE DATA =====
  const features = [
    {
      icon: "⚖️",
      title: "IPC–BNS Neural Mapping",
      description: "Deep learning framework that instantly maps IPC sections to BNS equivalents with 99.2% accuracy.",
      color: "gold"
    },
    {
      icon: "🧠",
      title: "Quantum Legal Prediction",
      description: "Next-gen transformer architecture predicting charges from natural language with unprecedented accuracy.",
      color: "silver"
    },
    {
      icon: "🔍",
      title: "Spatial Reasoning Engine",
      description: "3D visualization of legal relationships with interactive precedent mapping.",
      color: "gold"
    },
    {
      icon: "📚",
      title: "Neural Knowledge Base",
      description: "Dynamic legal knowledge graph that evolves with every case.",
      color: "silver"
    },
    {
      icon: "⚡",
      title: "Real-time Neural Analysis",
      description: "Sub-second processing with streaming inference and continuous learning.",
      color: "gold"
    },
    {
      icon: "🔒",
      title: "Zero-Knowledge Security",
      description: "Military-grade encryption – your data never leaves your control.",
      color: "silver"
    },
    {
      icon: "🎯",
      title: "Predictive Analytics",
      description: "AI-powered case outcome prediction with 94% accuracy rate.",
      color: "gold"
    },
    {
      icon: "🔄",
      title: "Automated Compliance",
      description: "Real-time regulatory compliance checking across jurisdictions.",
      color: "silver"
    }
  ];

  // Duplicate features for seamless infinite scroll
  const bannerFeatures = [...features, ...features, ...features]; // Triple for even smoother loop

  return (
    <Layout>
      <div className="home-cinematic">
        
        {/* ===== PARTICLE FIELD ===== */}
        <div className="particle-field">
          {particles.current.map((particle, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `particle-float ${particle.speed * 50}s infinite linear`,
              }}
            />
          ))}
        </div>

        {/* ===== HERO SECTION ===== */}
        <section className={`hero-cinematic ${isVisible ? "visible" : ""}`}>
          <div className="container">
            <div className="hero-content">
              
              <div className="hero-badge">
                <span className="badge-dot"></span>
                <span className="badge-text">⚡ LexAI 2.0 – Neural Legal Engine</span>
              </div>

              <h1 className="hero-title">
                <span className="title-line">
                  <span className="title-gradient shimmer-text">AI-Powered</span>
                </span>
                <span className="title-line">
                  Criminal Law Analysis
                </span>
              </h1>
              
              <p className="hero-description">
                Experience the future of legal intelligence. Our neural network analyzes millions of case laws, 
                statutes, and precedents in milliseconds.
              </p>
              
              <div className="hero-actions">
                <button className="btn btn-primary">
                  <span className="btn-content">
                    Start Free Trial
                    <span className="btn-arrow">→</span>
                  </span>
                </button>
                <button className="btn btn-outline">
                  <span className="btn-content">
                    <span className="btn-icon">🎬</span>
                    Watch Demo
                  </span>
                </button>
              </div>

              <div className="stats-hologram" ref={statsRef}>
                <div className="stat-item">
                  <div className="stat-value">{counts.accuracy}%</div>
                  <div className="stat-label">Neural Accuracy</div>
                  <div className="stat-trend">↑ +2.4%</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-value">{counts.cases.toLocaleString()}+</div>
                  <div className="stat-label">Cases Analyzed</div>
                  <div className="stat-trend">Real-time</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-value">{counts.uptime}%</div>
                  <div className="stat-label">Quantum Uptime</div>
                  <div className="stat-trend">99.9% SLA</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES GRID – STATIC GRID ===== */}
        <section className="features-grid-section">
          <div className="container">
            <div className="section-header">
              <div className="section-badge">
                <span className="badge-pulse"></span>
                <span>⚛️ Core Capabilities</span>
              </div>
              <h2 className="section-title">
                Everything you need for{" "}
                <span className="gradient-text">advanced legal analysis</span>
              </h2>
              <p className="section-description">
                Powered by next-generation neural architectures
              </p>
            </div>

            <div className="features-grid">
              {features.slice(0, 6).map((feature, index) => (
                <div
                  key={index}
                  className={`feature-card ${feature.color}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                  onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-glow"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HORIZONTAL BANNER CAROUSEL – ULTRA SLOW, NO PAUSE ===== */}
        <section className="banner-carousel-section" ref={featuresRef}>
          <div className="container">
            <div className="section-header">
              <div className="section-badge">
                <span className="badge-pulse"></span>
                <span>🎬 Infinite Intelligence Stream</span>
              </div>
              <h2 className="section-title">
                Continuously learning from{" "}
                <span className="gradient-text">millions of cases</span>
              </h2>
              <p className="section-description">
                Seamless • Infinite • Ultra-slow motion
              </p>
            </div>
          </div>

          <div className="banner-carousel-container">
            <div className="banner-carousel-track" ref={carouselRef}>
              {bannerFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className={`banner-card ${feature.color}`}
                >
                  <div className="banner-card-content">
                    <span className="banner-icon">{feature.icon}</span>
                    <span className="banner-title">{feature.title}</span>
                    <span className="banner-badge">AI</span>
                  </div>
                  <div className="banner-glow"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TRUST BAR ===== */}
        <div className="trust-bar">
          <div className="container">
            <div className="trust-text">Trusted by industry leaders</div>
            <div className="trust-logos">
              <span className="trust-logo">LegalTech ⚖️</span>
              <span className="trust-logo">Supreme AI 🧠</span>
              <span className="trust-logo">LawLab 🔬</span>
              <span className="trust-logo">JurisAI ⚡</span>
            </div>
          </div>
        </div>

        {/* ===== CTA SECTION ===== */}
        <section className="cta-dimensional" ref={ctaRef}>
          <div className="container">
            <div className="cta-card">
              <div className="cta-content">
                <div className="cta-badge">
                  <span className="badge-pulse"></span>
                  <span>🚀 Limited Time Offer</span>
                </div>
                
                <h2 className="cta-title">
                  Ready to transform{" "}
                  <span className="gradient-text">legal analysis</span>?
                </h2>
                
                <p className="cta-description">
                  Join 5,000+ forward-thinking legal professionals already using LexAI
                </p>
                
                <div className="cta-actions">
                  <button className="btn btn-primary btn-large">
                    <span className="btn-content">
                      Start 14-day Free Trial
                      <span className="btn-arrow">→</span>
                    </span>
                  </button>
                  <button className="btn btn-outline btn-large">
                    <span className="btn-content">
                      Schedule Demo
                    </span>
                  </button>
                </div>
                
                <div className="cta-features">
                  <div className="cta-feature">
                    <span className="feature-check">✓</span>
                    No credit card
                  </div>
                  <div className="cta-feature">
                    <span className="feature-check">✓</span>
                    Full access
                  </div>
                  <div className="cta-feature">
                    <span className="feature-check">✓</span>
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}