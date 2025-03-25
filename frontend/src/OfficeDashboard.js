import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OfficeDashboard.css";

const API_BASE_URL = "https://findopendentist.onrender.com";

const OfficeDashboard = ({ user }) => {
  const [availableSlots, setAvailableSlots] = useState(user.availableSlots || []);
  const [newSlot, setNewSlot] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user.email) {
      fetchAvailability();
    }
  }, [user.email]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active-offices`);
      const office = response.data.find(o => o.email === user.email);
      if (office) {
        setAvailableSlots(office.availableSlots || []);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const handleAddSlot = () => {
    if (newSlot && !availableSlots.includes(newSlot)) {
      setAvailableSlots([...availableSlots, newSlot]);
      setNewSlot("");
    }
  };

  const handleRemoveSlot = (slot) => {
    setAvailableSlots(availableSlots.filter(s => s !== slot));
  };

  const handleUpdateAvailability = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/update-availability`, {
        email: user.email,
        availableSlots,
      });

      if (response.data.success) {
        setMessage("Availability updated successfully.");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Welcome, {user.name}</h2>

      <div className="dashboard-section">
        <h3 className="section-title">Manage Your Available Time Slots</h3>

        <div className="slot-input-row">
          <input
            type="text"
            placeholder="e.g. 10:00 AM - 10:30 AM"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            className="slot-input"
          />
          <button onClick={handleAddSlot} className="add-btn">Add Slot</button>
        </div>

        {availableSlots.length > 0 && (
          <ul className="slots-list">
            {availableSlots.map((slot, index) => (
              <li key={index} className="slot-item">
                {slot}
                <button className="remove-btn" onClick={() => handleRemoveSlot(slot)}>
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={handleUpdateAvailability} className="update-btn">
          Update Availability
        </button>
        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
};

export default OfficeDashboard;