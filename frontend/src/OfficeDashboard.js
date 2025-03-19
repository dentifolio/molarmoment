import React, { useState, useEffect } from "react";
import axios from "axios";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 5; hour <= 21; hour++) {
    const amPm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour > 12 ? hour - 12 : hour;
    slots.push(`${formattedHour}:00 ${amPm}`);
    slots.push(`${formattedHour}:30 ${amPm}`);
  }
  return slots;
};

const OfficeDashboard = ({ user }) => {
  const [availableSlots, setAvailableSlots] = useState(user?.availableSlots || []);
  const [appointments, setAppointments] = useState([]);
  const [editingInfo, setEditingInfo] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
  oldEmail: user?.email || "",  // Store old email for comparison
  newEmail: user?.email || "",
  name: user?.name || "",
  address: user?.address || "",
  phone: user?.phone || "",
  website: user?.website || "",
  zipCode: user?.zipCode || "",
  state: user?.state || "",
});

const statesList = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000); // 🔄 Live refresh every 5 sec
    return () => clearInterval(interval);
  }, [user.id]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/appointments?officeId=${user.id}`);
      if (response.data.length > 0) {
        setAppointments(response.data);  // ✅ Update UI with latest bookings
      } else {
        setAppointments([]); // ✅ Show "No new bookings" if empty
      }
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  const updateOfficeInfo = async () => {
    try {
      const response = await axios.post("http://localhost:5000/update-office-info", updatedInfo);

      if (response.data.success) {
        alert("✅ Office info updated successfully!");
        setEditingInfo(false);
      } else {
        alert("❌ Update failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating office info", error);
      alert("❌ Error updating office info. Please try again.");
    }
  };

  const toggleSlot = async (slot) => {
    const updatedSlots = availableSlots.includes(slot)
      ? availableSlots.filter((s) => s !== slot)
      : [...availableSlots, slot];

    try {
      const response = await axios.post("http://localhost:5000/update-availability", {
        email: user.email,
        availableSlots: updatedSlots,
      });

      setAvailableSlots(response.data.office.availableSlots);
    } catch (error) {
      console.error("Failed to update slots", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "40px", marginTop: "1200px" }}>
      <div style={{ display: "flex", gap: "30px" }}>

        {/* Instructions Panel (Left) */}
        <div style={{ flex: "1", borderRight: "2px solid #ddd", padding: "20px" }}>
          <h2>📌 How to Manage Your Office</h2>
          <ul style={{ lineHeight: "1.8" }}>
            <li>🔹 <strong>Update Your Profile</strong> – Edit office name, address, phone, email, and website.</li>
            <li>🔹 <strong>Set Your Availability</strong> – Click time slots to add/remove availability.</li>
            <li>🔹 <strong>View Appointments</strong> – See patient details for confirmed bookings.</li>
            <li>🔹 <strong>Automatic Reset</strong> – Appointments are cleared every 24 hours.</li>
          </ul>
        </div>

        {/* Office Profile + Availability (Center) */}
        <div style={{ flex: "2", padding: "20px" }}>
          <h2>Welcome, {user.name}</h2>

          {/* Office Info Section */}
          <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "10px", marginBottom: "30px" }}>
            <h3>🏢 Office Information</h3>

            {editingInfo ? (
              <>
              <input
                type="text"
                value={updatedInfo.name}
                onChange={(e) => setUpdatedInfo({ ...updatedInfo, name: e.target.value })}
                placeholder="Office Name"
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
              <input
                type="text"
                value={updatedInfo.address}
                onChange={(e) => setUpdatedInfo({ ...updatedInfo, address: e.target.value })}
                placeholder="Office Address"
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
              <input
                type="text"
                value={updatedInfo.phone}
                onChange={(e) => setUpdatedInfo({ ...updatedInfo, phone: e.target.value })}
                placeholder="Phone Number"
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
                <input
                  type="email"
                  value={updatedInfo.newEmail}
                  onChange={(e) => setUpdatedInfo({ ...updatedInfo, newEmail: e.target.value })}
                  placeholder="Office Email"
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <input
                  type="text"
                  value={updatedInfo.website}
                  onChange={(e) => setUpdatedInfo({ ...updatedInfo, website: e.target.value })}
                  placeholder="Website"
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <select
                  value={updatedInfo.state}
                  onChange={(e) => setUpdatedInfo({ ...updatedInfo, state: e.target.value })}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                >
                  {statesList.map((stateCode) => (
                    <option key={stateCode} value={stateCode}>{stateCode}</option>
                  ))}
                </select>

                <button onClick={updateOfficeInfo} style={{ backgroundColor: "#007bff", color: "white", padding: "10px", width: "100%", borderRadius: "5px" }}>
                  Save
                </button>
              </>
            ) : (
              <>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Address:</strong> {user.address}</p>
              <p><strong>ZIP Code:</strong> {user.zipCode}</p>
              <p><strong>State:</strong> {user.state}</p>

                <button onClick={() => setEditingInfo(true)} style={{ backgroundColor: "#28a745", color: "white", padding: "10px", width: "100%", borderRadius: "5px", marginTop: "10px" }}>
                  Edit Info
                </button>
              </>
            )}

          </div>

          {/* Available Time Slots */}
          <h3>🕒 Available Time Slots</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "10px" }}>
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => toggleSlot(slot)}
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: availableSlots.includes(slot) ? "#28a745" : "#ddd",
                  color: availableSlots.includes(slot) ? "white" : "black",
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Information (Right) */}
        <div style={{ flex: "1", borderLeft: "2px solid #ddd", paddingLeft: "20px" }}>
          <h2>📋 Appointments (Live Updates)</h2>
          {appointments.length === 0 ? (
            <p>No new bookings yet.</p>
          ) : (
            appointments.map((appt, index) => (
              <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                <p><strong>Patient:</strong> {appt.patientName}</p>
                <p><strong>Time:</strong> {appt.timeSlot}</p>
                <p><strong>Reason:</strong> {appt.reason}</p>
                <p><strong>Payment:</strong> {appt.paymentMethod}</p>
                <p><strong>Contact:</strong> {appt.patientEmail}, {appt.patientPhone}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
