import React from "react";
import { Link } from "react-router-dom";
import "./AuthButtons.css"; // Add styles for the bubble buttons

const AuthButtons = () => {
  return (
    <div className="auth-container">
      <Link to="/login" className="auth-button">Login</Link>
      <span className="separator">|</span>
      <Link to="/signup" className="auth-button">Sign Up</Link>
    </div>
  );
};

export default AuthButtons;
