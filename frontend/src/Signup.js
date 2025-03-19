import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY"
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    website: "",
    zipCode: "",
    state: "NY", // Default to NY
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:5000/signup", formData);
      console.log("Signup successful:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Office Signup</h2>
      <div className="signup-form">
        <input type="text" name="name" placeholder="Office Name" value={formData.name} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
        <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} />
        <input type="text" name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleChange} />

        {/* State Dropdown */}
        <select name="state" value={formData.state} onChange={handleChange}>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <input type="text" name="website" placeholder="Website (Optional)" value={formData.website} onChange={handleChange} />
        <button onClick={handleSignup}>Sign Up</button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Signup;
