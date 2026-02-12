import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const loginFields = [
    { name: "email", type: "email", placeholder: "Professional Email Address" },
    { name: "password", type: "password", placeholder: "Password" }
  ];

  const signupFields = [
    { name: "fullName", type: "text", placeholder: "Full Legal Name" },
    { name: "email", type: "email", placeholder: "Professional Email Address" },
    { name: "organization", type: "text", placeholder: "Law Firm / University" },
    { name: "password", type: "password", placeholder: "Create Secure Password" },
    { name: "confirmPassword", type: "password", placeholder: "Confirm Password" }
  ];

  const fields = isLogin ? loginFields : signupFields;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);

    const endpoint = isLogin ? "login" : "signup";

    try {
      const res = await fetch(`http://localhost:4000/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Authentication failed");

      localStorage.setItem("token", data.token);
      navigate("/chatbot");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-page-container">
          {/* Left Panel - Dark Theme with Gold/Silver */}
          <div className="auth-left-panel">
            <div className="legal-icon">
              <div className="scale-icon">⚖️</div>
              <div className="book-icon">📚</div>
              <div className="ai-icon">🤖</div>
            </div>
            <h2>{isLogin ? "Welcome Back" : "Join the Legal AI Revolution"}</h2>
            <p>
              {isLogin
                ? "Access advanced legal analytics and AI-powered research tools."
                : "Be part of the future of legal intelligence and AI-driven analysis."}
            </p>
            
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🔒</span>
                <span>Secure & Encrypted</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time Analysis</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">👥</span>
                <span>Collaborative Tools</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Dark Theme with Gold/Silver */}
          <div className="auth-right-panel">
            <div className="auth-header">
              <h1 className="shimmer-text">{isLogin ? "Login" : "Create Account"}</h1>
              <p>
                {isLogin
                  ? "Sign in to continue your legal research"
                  : "Start your journey with AI Legal Intelligence"}
              </p>
            </div>

            <div className="auth-toggle">
              <button
                className={`toggle-btn ${isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.name} className="form-group">
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    required
                    className="form-input"
                    onChange={handleChange}
                  />
                  <div className="input-border"></div>
                </div>
              ))}

              {isLogin && (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  <a href="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className={`submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : isLogin ? (
                  <>
                    <span>→</span>
                    Login to Dashboard
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Create Professional Account
                  </>
                )}
              </button>
            </form>

            {/* <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-auth">
              <button className="social-btn">
                <span>⚖️</span> Legal ID
              </button>
              <button className="social-btn">
                <span>🏛️</span> Court Credentials
              </button>
            </div> */}

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  className="switch-auth"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? " Sign Up" : " Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}