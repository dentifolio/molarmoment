import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./OfficeDashboard.css"; // Add styles for better UI

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY"
];

// Generate time slots from 3 AM to 11:30 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 3; hour < 24; hour++) {
    const hourFormatted = hour < 10 ? `0${hour}` : hour;
    slots.push(`${hourFormatted}:00`);
    slots.push(`${hourFormatted}:30`);
  }
  return slots;
};

const OfficeDashboard = ({ office, setOffice }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: office?.name || "",
    email: office?.email || "",
    address: office?.address || "",
    city: office?.city || "",
    phone: office?.phone || "",
    website: office?.website || "",
    zipCode: office?.zipCode || "",
    state: office?.state || "NY",
  });

  const [message, setMessage] = useState("");
  const [bookedForms, setBookedForms] = useState([]);
  const [editing, setEditing] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    if (office?.id) {
      fetchBookedForms(office.id);
      fetchAvailableSlots(office.id);
    }
  }, [office?.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("https://findopendentist.onrender.com/update-office", {
        email: formData.email,
        ...formData,
      });

      setOffice(response.data.office);
      setMessage("✅ Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error.response?.data || error.message);
      setMessage("⚠️ Error updating profile.");
    }
  };

  const fetchBookedForms = async (officeId) => {
    try {
      const response = await axios.get(`https://findopendentist.onrender.com/booked-forms/${officeId}`);
      setBookedForms(response.data);
    } catch (error) {
      console.error("Failed to fetch booked forms:", error);
    }
  };

  const fetchAvailableSlots = async (officeId) => {
    try {
      const response = await axios.get(`https://findopendentist.onrender.com/available-slots/${officeId}`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
    }
  };

  const toggleSlotSelection = (slot) => {
    setSelectedSlots((prevSelectedSlots) =>
      prevSelectedSlots.includes(slot)
        ? prevSelectedSlots.filter((s) => s !== slot)
        : [...prevSelectedSlots, slot]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="office-dashboard-container">
      <h2>Office Information</h2>
      {editing ? (
        <div className="profile-form">
          <label>Office Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />

          <label>Street Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />

          <label>City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} />

          <div className="zip-state">
            <div>
              <label>ZIP Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />
            </div>

            <div>
              <label>State</label>
              <select name="state" value={formData.state} onChange={handleChange}>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />

          <label>Email (Cannot be changed)</label>
          <input type="email" name="email" value={formData.email} readOnly />

          <label>Website</label>
          <input type="text" name="website" value={formData.website} onChange={handleChange} />

          <button className="save-btn" onClick={handleSave}>Save Changes</button>
          <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
          {message && <p className="status-message">{message}</p>}
        </div>
      ) : (
        <div className="profile-view">
          <p><strong>Office Name:</strong> {formData.name}</p>
          <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
          <p><strong>Phone:</strong> {formData.phone}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Website:</strong> {formData.website}</p>
          <button className="edit-btn" onClick={() => setEditing(true)}>Edit Information</button>
        </div>
      )}

      <div className="available-slots">
        <h3>Available Time Slots</h3>
        <div className="slots-container">
          {generateTimeSlots().map((slot, index) => (
            <button
              key={index}
              className={`slot-btn ${selectedSlots.includes(slot) ? 'selected' : ''}`}
              onClick={() => toggleSlotSelection(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="booked-forms-section">
        <h3>Booked Forms</h3>
        {bookedForms.length > 0 ? (
          bookedForms.map((form, index) => (
            <div key={index} className="booked-form">
              <p>Date: {form.date}</p>
              <p>Time: {form.time}</p>
              <p>Patient: {form.patientName}</p>
            </div>
          ))
        ) : (
          <p>No booked forms to display.</p>
        )}
      </div>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default OfficeDashboard;