import React, { useState } from "react";
import axios from "axios";

const BookingForm = ({ office, onClose }) => {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Insurance");
  const [message, setMessage] = useState("");

  const appointmentReasons = ["New Patient Exam", "Emergency", "Routine Check-up", "Cleaning", "Other"];

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!patientName || !patientEmail || !patientPhone || !selectedTime || !reason) {
      setMessage("⚠️ Please fill out all fields.");
      return;
    }

    const finalReason = reason === "Other" ? otherReason : reason;

    try {
      const response = await axios.post("https://findopendentist.onrender.com/book-slot", {
        officeId: office.id,
        timeSlot: selectedTime,
        patientName,
        patientEmail,
        patientPhone,
        reason: finalReason,
        paymentMethod,
      });

      if (response.data.success) {
        setMessage(`✅ Successfully booked ${selectedTime} for ${patientName}!`);
        setTimeout(() => {
          onClose(); // Close form after booking
        }, 2000);
      } else {
        setMessage("⚠️ Booking failed. Try again.");
      }
    } catch (error) {
      console.error("Error booking slot:", error);
      setMessage("⚠️ Booking failed. Try again.");
    }
  };

  return (
    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", width: "400px" }}>
      <h2>📅 Book an Appointment</h2>
      <form onSubmit={handleBooking}>
        <label>Full Name:</label>
        <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

        <label>Email:</label>
        <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

        <label>Phone Number:</label>
        <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

        <label>Time Slot:</label>
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          <option value="">Select a time</option>
          {office.availableSlots.map((slot, index) => (
            <option key={index} value={slot}>{slot}</option>
          ))}
        </select>

        <label>Reason for Appointment:</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          <option value="">Select a reason</option>
          {appointmentReasons.map((r, index) => (
            <option key={index} value={r}>{r}</option>
          ))}
        </select>

        {reason === "Other" && (
          <input
            type="text"
            placeholder="Enter your reason"
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        )}

        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          <option value="Insurance">Insurance</option>
          <option value="Cash">Cash</option>
        </select>

        {message && <p style={{ color: "red", marginBottom: "10px" }}>{message}</p>}

        <button type="submit" style={{ backgroundColor: "#28a745", color: "white", padding: "10px", width: "100%", borderRadius: "5px", marginBottom: "10px" }}>
          Confirm Booking
        </button>
        <button type="button" onClick={onClose} style={{ backgroundColor: "#dc3545", color: "white", padding: "10px", width: "100%", borderRadius: "5px" }}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
