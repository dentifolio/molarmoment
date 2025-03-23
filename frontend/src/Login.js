import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "./Login.css"; // Add styles for better UI

const Login = ({ setOffice }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://findopendentist.onrender.com/login", {
        email,
        password,
      });

      setOffice(response.data.office);
      history.push("/office-profile");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setMessage("⚠️ Error logging in.");
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
      <div className="login-form">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="login-btn" onClick={handleLogin}>Log In</button>
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;