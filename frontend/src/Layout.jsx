import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Layout.css";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/auth");
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container container">
          <Link to="/" className="navbar-brand">
            <span className="brand-text shimmer-text">LexAI</span>
            <span className="brand-subtitle">Legal Intelligence</span>
          </Link>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              <span className="nav-icon">⚖️</span>
              Home
            </Link>

            {isLoggedIn && (
              <Link
                to="/chatbot"
                className={`nav-link ${location.pathname === "/chatbot" ? "active" : ""}`}
              >
                <span className="nav-icon">🤖</span>
                AI Assistant
              </Link>
            )}

            {!isLoggedIn ? (
              <Link
                to="/auth"
                className={`nav-link ${location.pathname === "/auth" ? "active" : ""}`}
              >
                <span className="nav-icon">🔐</span>
                Login
              </Link>
            ) : (
              <button className="logout-btn" onClick={logout}>
                <span className="nav-icon">🚪</span>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </>
  );
}