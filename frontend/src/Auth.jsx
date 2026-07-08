import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import "./Auth.css";

export default function Auth() {

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
  });

  const navigate = useNavigate();
  const API_URL = "http://localhost:4000";

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+|\\:;"'<>,./~`]).{8,}$/;

  const loginFields = [
    { name: "email",    type: "email",    placeholder: "Email Address" },
    { name: "password", type: "password", placeholder: "Password"      },
  ];

  const signupFields = [
    { name: "fullName",        type: "text",     placeholder: "Full Legal Name"        },
    { name: "email",           type: "email",    placeholder: "Professional Email"      },
    { name: "organization",    type: "text",     placeholder: "Law Firm / Institution"  },
    { name: "password",        type: "password", placeholder: "Create Password"         },
    { name: "confirmPassword", type: "password", placeholder: "Confirm Password"        },
  ];

  const fields = isLogin ? loginFields : signupFields;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!isLogin && !passwordRegex.test(formData.password)) {
      alert(
        "Password must contain:\n\n" +
        "• Minimum 8 characters\n" +
        "• Uppercase letter\n" +
        "• Lowercase letter\n" +
        "• Number\n" +
        "• Special character"
      );
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? "login" : "signup";

    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { email: formData.email, password: formData.password }
            : { name: formData.fullName, email: formData.email, password: formData.password }
        ),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error("Server error. Please try again.");
      }

      if (!res.ok) throw new Error(data.msg || "Authentication failed.");

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

          {/* ── LEFT PANEL ── */}
          <div className="auth-left-panel">

            <div className="legal-icon">
              {/* Scale of Justice */}
              <div className="scale-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M3 6l4.5 9M3 6h18M20.5 15l-4.5-9M7.5 15h9M3 21h18" />
                  <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              {/* Open Book */}
              <div className="book-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              {/* AI / Circuit */}
              <div className="ai-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                  <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2"/>
                  <path d="M9 9 6 6M15 9l3-3M9 15l-3 3M15 15l3 3"/>
                </svg>
              </div>
            </div>

            <h2>
              {isLogin
                ? "Welcome back."
                : "Join the Legal AI Revolution."}
            </h2>

            <p>
              {isLogin
                ? "Access AI-powered legal research, case analytics, and intelligent document analysis — all from a single platform."
                : "Harness the power of artificial intelligence for legal research, precedent analysis, and contract intelligence."}
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <div className="auth-feature-text">
                  <span className="auth-feature-title">Secure &amp; Encrypted</span>
                  <span className="auth-feature-desc">End-to-end encryption on all data</span>
                </div>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </span>
                <div className="auth-feature-text">
                  <span className="auth-feature-title">Real-time Analysis</span>
                  <span className="auth-feature-desc">Instant results across all bns sections</span>
                </div>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                <div className="auth-feature-text">
                  <span className="auth-feature-title">Query Intelligence </span>
                  <span className="auth-feature-desc">Understands complex legal questions naturally</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="auth-right-panel">

            <div className="auth-header">
              <h1 className="shimmer-text">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p>
                {isLogin
                  ? "Enter your credentials to access your workspace."
                  : "Set up your professional account to get started."}
              </p>
            </div>

            {/* Toggle */}
            <div className="auth-toggle">
              <button
                className={`toggle-btn ${isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(true)}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(false)}
                type="button"
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.name} className="form-group">
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    required
                    className="form-input"
                    value={formData[field.name]}
                    onChange={handleChange}
                    autoComplete={
                      field.name === "password" || field.name === "confirmPassword"
                        ? "new-password"
                        : field.name === "email"
                        ? "email"
                        : "off"
                    }
                  />
                  <div className="input-border" />
                  {field.name === "password" && !isLogin && (
                    <small className="password-hint">
                      Min. 8 characters — uppercase, lowercase, number, and special character required.
                    </small>
                  )}
                </div>
              ))}

              {isLogin && (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span className="checkmark" />
                    Keep me signed in
                  </label>
                  <a href="/forgot-password" className="forgot-link">
                    Forgot password?
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
                    <span className="spinner" />
                    Authenticating...
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  className="switch-auth"
                  onClick={() => setIsLogin(!isLogin)}
                  type="button"
                >
                  {isLogin ? "Register" : "Sign In"}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}