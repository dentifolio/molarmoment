import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const AuthButtons = () => {
  return (
    <div className="auth-buttons">
      <Link to="/login" className="auth-btn">
        Login
      </Link>
      <Link to="/signup" className="auth-btn">
        Sign Up
      </Link>
    </div>
  );
};

const Navbar = ({ isLoggedIn, handleLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          FindOpenDentist.com
        </Link>
      </div>
      <div className="nav-right">
        {isLoggedIn ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          // <AuthButtons /> // Removed login/signup buttons
          null
        )}
      </div>
    </nav>
  );
};

export default Navbar;
