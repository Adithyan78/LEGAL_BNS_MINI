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
    organization: ""
  });

  const navigate = useNavigate();

  const API_URL = "http://localhost:4000";


  // Strong password regex
  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+|\\:;"'<>,./~`]).{8,}$/;


  const loginFields = [

    {
      name: "email",
      type: "email",
      placeholder: "Professional Email Address",
    },

    {
      name: "password",
      type: "password",
      placeholder: "Password",
    },

  ];


  const signupFields = [

    {
      name: "fullName",
      type: "text",
      placeholder: "Full Legal Name",
    },

    {
      name: "email",
      type: "email",
      placeholder: "Professional Email Address",
    },

    {
      name: "organization",
      type: "text",
      placeholder: "Law Firm / University",
    },

    {
      name: "password",
      type: "password",
      placeholder: "Create Secure Password",
    },

    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
    },

  ];


  const fields =
    isLogin
    ? loginFields
    : signupFields;



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!isLogin &&
        formData.password !== formData.confirmPassword) {

      alert("Passwords do not match!");

      return;

    }


    if (!isLogin &&
        !passwordRegex.test(formData.password)) {

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


    const endpoint =
      isLogin
      ? "login"
      : "signup";


    try {

      const res =
        await fetch(
          `${API_URL}/auth/${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(

              isLogin

              ? {
                  email: formData.email,
                  password: formData.password
                }

              : {
                  name: formData.fullName,
                  email: formData.email,
                  password: formData.password
                }

            ),
          }
        );


      const text =
        await res.text();


      let data;


      try {

        data =
          JSON.parse(text);

      }

      catch {

        console.error("Non JSON:", text);

        throw new Error(
          "Backend error. Check server."
        );

      }


      if (!res.ok) {

        throw new Error(
          data.msg ||
          "Authentication failed"
        );

      }


      localStorage.setItem(
        "token",
        data.token
      );


      navigate("/chatbot");

    }

    catch (err) {

      alert(err.message);

    }

    finally {

      setIsLoading(false);

    }

  };



  return (

    <Layout>

      <div className="auth-page">

        <div className="auth-page-container">


          {/* LEFT PANEL */}

          <div className="auth-left-panel">

            <div className="legal-icon">

              <div className="scale-icon">⚖️</div>

              <div className="book-icon">📚</div>

              <div className="ai-icon">🤖</div>

            </div>


            <h2>

              {
                isLogin
                ? "Welcome Back"
                : "Join the Legal AI Revolution"
              }

            </h2>


            <p>

              {
                isLogin
                ? "Access advanced legal analytics and AI-powered research tools."
                : "Be part of the future of legal intelligence and AI-driven analysis."
              }

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



          {/* RIGHT PANEL */}

          <div className="auth-right-panel">


            <div className="auth-header">

              <h1 className="shimmer-text">

                {
                  isLogin
                  ? "Login"
                  : "Create Account"
                }

              </h1>


              <p>

                {
                  isLogin
                  ? "Sign in to continue your legal research"
                  : "Start your journey with AI Legal Intelligence"
                }

              </p>

            </div>



            {/* TOGGLE */}

            <div className="auth-toggle">

              <button
                className={`toggle-btn ${isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(true)}
                type="button"
              >

                Login

              </button>


              <button
                className={`toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(false)}
                type="button"
              >

                Sign Up

              </button>

            </div>



            {/* FORM */}

            <form className="auth-form" onSubmit={handleSubmit}>

              {

                fields.map((field) => (

                  <div key={field.name} className="form-group">

                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      className="form-input"
                      value={formData[field.name]}
                      onChange={handleChange}
                    />

                    <div className="input-border"></div>


                    {

                      field.name === "password" &&
                      !isLogin &&

                      <small className="password-hint">
                        Must include uppercase, lowercase, number, special character (8+ chars)
                      </small>

                    }

                  </div>

                ))

              }



              {

                isLogin &&

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

              }



              <button
                type="submit"
                className={`submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >

                {

                  isLoading

                  ? "Processing..."

                  : isLogin

                  ? "Login to Dashboard"

                  : "Create Professional Account"

                }

              </button>


            </form>



            <div className="auth-footer">

              <p>

                {
                  isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"
                }


                <button
                  className="switch-auth"
                  onClick={() => setIsLogin(!isLogin)}
                  type="button"
                >

                  {
                    isLogin
                    ? " Sign Up"
                    : " Login"
                  }

                </button>

              </p>

            </div>


          </div>


        </div>


      </div>


    </Layout>

  );

}