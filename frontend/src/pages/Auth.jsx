import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Auth({ setIsLoggedIn, setUserEmail }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient"
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!form.name || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });

      const data = await res.text();
      if (data === "User registered" || data.includes("registered")) {
        alert("Account created successfully. Please login.");
        setIsSignup(false);
        setForm({ name: "", email: "", password: "", confirmPassword: "", role: "patient" });
      } else {
        alert(data);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.text();
      if (data === "Login successful") {
        setIsLoggedIn(true);
        setUserEmail(form.email);
        alert("Welcome back!");
        navigate("/dashboard");
      } else {
        alert(data);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <img src="/rognidhi-logo.svg?v=2" alt="RogNidhi Logo" className="auth-logo-img" />
          <h2 className="auth-title">RogNidhi</h2>
        </div>
        <p className="auth-subtitle">Secure Medical Document Management</p>
        
        {isSignup ? (
          <>
            <h3>Create Account</h3>
            
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="auth-input"
              style={{ '--input-index': 0 }}
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
              style={{ '--input-index': 1 }}
            />

            <div className="role-selector">
              <label>I am a:</label>
              <div className="role-options">
                <label className={`role-option ${form.role === 'patient' ? 'selected' : ''}`} style={{ '--role-index': 0 }}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={form.role === 'patient'}
                    onChange={handleChange}
                  />
                  <span className="role-label">👤 Patient</span>
                  <span className="role-desc">Store medical records</span>
                </label>
                <label className={`role-option ${form.role === 'doctor' ? 'selected' : ''}`} style={{ '--role-index': 1 }}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={form.role === 'doctor'}
                    onChange={handleChange}
                  />
                  <span className="role-label">👨‍⚕️ Doctor</span>
                  <span className="role-desc">Access patient records</span>
                </label>
              </div>
            </div>
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
              style={{ '--input-index': 2 }}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="auth-input"
              style={{ '--input-index': 3 }}
            />
            
            <button 
              className="auth-btn" 
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>

            <p className="auth-toggle">
              Already have an account?{" "}
              <button 
                onClick={() => {
                  setIsSignup(false);
                  setForm({ name: "", email: "", password: "", confirmPassword: "", role: "patient" });
                }}
                className="toggle-btn"
              >
                Sign In
              </button>
            </p>
          </>
        ) : (
          <>
            <h3>Sign In</h3>
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
              style={{ '--input-index': 0 }}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
              style={{ '--input-index': 1 }}
            />
            
            <button 
              className="auth-btn" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="auth-toggle">
              Don't have an account?{" "}
              <button 
                onClick={() => {
                  setIsSignup(true);
                  setForm({ name: "", email: "", password: "", confirmPassword: "", role: "patient" });
                }}
                className="toggle-btn"
              >
                Create one
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
