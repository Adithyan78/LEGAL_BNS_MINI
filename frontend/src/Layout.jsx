import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Layout.css";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/auth");
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <Link to="/" className="navbar-brand">
              <span className="brand-icon">⚖️</span>
              <div className="brand-text-wrapper">
                <span className="brand-text">LexAI</span>
                <span className="brand-subtitle">Legal Intelligence</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              <span className="nav-icon"></span>
              Home
            </Link>

            {isLoggedIn && (
              <Link
                to="/chatbot"
                className={`nav-link ${location.pathname === "/chatbot" ? "active" : ""}`}
              >
                <span className="nav-icon"></span>
                AI Assistant
              </Link>
            )}

            {!isLoggedIn ? (
              <Link
                to="/auth"
                className={`nav-link ${location.pathname === "/auth" ? "active" : ""}`}
              >
                <span className="nav-icon"></span>
                Sign In
              </Link>
            ) : (
              <button className="nav-link logout-btn" onClick={logout}>
                <span className="nav-icon"></span>
                Sign Out
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-links-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <span className="nav-icon"></span>
            Home
          </Link>

          {isLoggedIn && (
            <Link
              to="/chatbot"
              className={`nav-link ${location.pathname === "/chatbot" ? "active" : ""}`}
            >
              <span className="nav-icon"></span>
              AI Assistant
            </Link>
          )}

          {!isLoggedIn ? (
            <Link
              to="/auth"
              className={`nav-link ${location.pathname === "/auth" ? "active" : ""}`}
            >
              <span className="nav-icon"></span>
              Sign In
            </Link>
          ) : (
            <button className="nav-link logout-btn" onClick={logout}>
              <span className="nav-icon"></span>
              Sign Out
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </>
  );
}