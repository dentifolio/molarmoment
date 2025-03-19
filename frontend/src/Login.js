import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleLogin = async () => {
    try {
      console.log("Attempting login with:", email, password);
      const response = await axios.post("http://localhost:5000/login", { email, password });
      console.log("Server response:", response.data);

      if (response.data.success) {
        onLogin(response.data.office);
        setError("");
        navigate("/dashboard"); // ✅ Redirect to dashboard after login
      } else {
        setError(response.data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/forgot-password", { email });
      setMessage(response.data.message);
      setError("");
    } catch (error) {
      setError("Failed to send reset link.");
    }
  };

  return (
    <div className="login-container">
      {/* 📌 Instructions Section */}
      <div className="instructions">
        <h2>How It Works</h2>
        <p>Welcome to **Find Open Dentist**. This platform allows dental offices to list their **real-time availability**, making it easy for patients to book open slots instantly.</p>

        <h3>📌 Steps for Dental Offices:</h3>
        <ul>
          <li>🔹 **Login** with your registered email and password.</li>
          <li>🔹 **Manage Your Profile** – Update office details, phone number, and website.</li>
          <li>🔹 **Set Availability** – Select available time slots for appointments.</li>
          <li>🔹 **Patients Can Book** – Open slots will be visible for patients to schedule visits.</li>
        </ul>

        <h3>Need Help?</h3>
        <p>Click **Forgot Password** if you need to reset your login credentials.</p>
      </div>

      {/* 📌 Login Form Section */}
      <div className="login-form">
        <h2>Office Login</h2>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
        <button className="forgot-password" onClick={handleForgotPassword}>Forgot Password?</button>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
