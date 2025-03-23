import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OfficeProfile.css"; // Add styles for better UI

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY"
];

const OfficeProfile = ({ office, setOffice }) => {
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

  useEffect(() => {
    if (office?.id) {
      fetchBookedForms(office.id);
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

  return (
    <div className="office-profile-container">
      <h2>Office Information</h2>
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
        {message && <p className="status-message">{message}</p>}
      </div>

      <div className="booked-forms-section">
        <h3>Booked Forms</h3>
        {bookedForms.length > 0 ? (
          bookedForms.map((form, index) => (
            <div key={index} className="booked-form">
              <p>Date: {form.date}</p>
              <p>Time: {form.time}</p>
              <p>Patient: {form.patientName}</p>
              {/* Add more fields as required */}
            </div>
          ))
        ) : (
          <p>No booked forms to display.</p>
        )}
      </div>
    </div>
  );
};

export default OfficeProfile;