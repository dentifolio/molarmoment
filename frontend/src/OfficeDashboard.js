import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OfficeDashboard.css";

const API_BASE_URL = "https://findopendentist.onrender.com";

const OfficeDashboard = ({ user }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [saving, setSaving] = useState(false);

  const allSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];

  useEffect(() => {
    if (user?.email) {
      fetchAvailability();
      fetchBookedAppointments();
    }
  }, [user?.email]);

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

  const fetchBookedAppointments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`, {
        params: { officeId: user.id },
      });
      setBookedAppointments(response.data.map(app => app.timeSlot));
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const toggleSlot = (slot) => {
    if (availableSlots.includes(slot)) {
      setAvailableSlots(availableSlots.filter(s => s !== slot));
    } else {
      setAvailableSlots([...availableSlots, slot]);
    }
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/update-availability`, {
        email: user.email,
        availableSlots,
      });
      alert("Availability saved!");
    } catch (error) {
      console.error("Error saving availability:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="office-dashboard">
      <h2>Welcome, {user.name}</h2>
      <p>Select time slots you're available for today:</p>

      <div className="slots-container">
        {allSlots.map((slot) => (
          <button
            key={slot}
            className={`slot-btn ${availableSlots.includes(slot) ? "selected" : ""} ${bookedAppointments.includes(slot) ? "booked" : ""}`}
            onClick={() => toggleSlot(slot)}
            disabled={bookedAppointments.includes(slot)}
          >
            {slot}
          </button>
        ))}
      </div>

      <button className="save-btn" onClick={saveAvailability} disabled={saving}>
        {saving ? "Saving..." : "Save Availability"}
      </button>
    </div>
  );
};

export default OfficeDashboard;