import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";
import "./Login.css";

const API_BASE_URL = "https://findopendentist.onrender.com"; // ✅ Ensure correct API URL

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleLogin = async () => {
    try {
      console.log("🔄 Attempting login with:", email, password);
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

      console.log("✅ Server response:", response.data);

      if (response.data.success) {
        onLogin(response.data.office);
        setError("");
        navigate("/dashboard"); // ✅ Redirect to dashboard after login
      } else {
        setError(response.data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("⚠️ Enter your email to reset the password.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setMessage(response.data.message || "✅ Reset link sent to your email.");
      setError("");
    } catch (error) {
      console.error("❌ Forgot password failed:", error.response?.data || error.message);
      setError("Failed to send reset link. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {/* 📌 Instructions Section */}
      <div className="instructions">
        <h2>How It Works</h2>
        <p>
          Welcome to <strong>Find Open Dentist</strong>. This platform allows dental offices to list their
          <strong> real-time availability</strong>, making it easy for patients to book open slots instantly.
        </p>

        <h3>📌 Steps for Dental Offices:</h3>
        <ul>
          <li>🔹 <strong>Login</strong> with your registered email and password.</li>
          <li>🔹 <strong>Manage Your Profile</strong> – Update office details, phone number, and website.</li>
          <li>🔹 <strong>Set Availability</strong> – Select available time slots for appointments.</li>
          <li>🔹 <strong>Patients Can Book</strong> – Open slots will be visible for patients to schedule visits.</li>
        </ul>

        <h3>Need Help?</h3>
        <p>Click <strong>Forgot Password</strong> if you need to reset your login credentials.</p>
      </div>

      {/* 📌 Login Form Section */}
      <div className="login-form">
        <h2>Office Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <button className="forgot-password" onClick={handleForgotPassword}>Forgot Password?</button>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
