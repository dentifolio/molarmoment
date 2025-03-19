import React, { useState } from "react";
import axios from "axios";

const BookingModal = ({ office, onClose }) => {
    const [selectedSlot, setSelectedSlot] = useState(null);

    const handleBooking = async () => {
        if (!selectedSlot) return alert("Select a time slot");

        try {
            await axios.post("http://localhost:5000/book-appointment", {
                officeId: office.id,
                timeSlot: selectedSlot
            });
            alert("Appointment booked successfully!");
            onClose();
        } catch (error) {
            console.error("Booking error:", error);
            alert("Failed to book appointment.");
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>Book Appointment at {office.name}</h3>
                <select onChange={(e) => setSelectedSlot(e.target.value)} style={styles.select}>
                    <option value="">Select a Time Slot</option>
                    {office.availableSlots.map((slot, index) => (
                        <option key={index} value={slot}>{slot}</option>
                    ))}
                </select>
                <button onClick={handleBooking} style={styles.button}>Confirm Booking</button>
                <button onClick={onClose} style={styles.cancel}>Cancel</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
    modal: { background: "white", padding: "20px", borderRadius: "10px", textAlign: "center" },
    select: { padding: "8px", marginBottom: "10px" },
    button: { padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    cancel: { padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", marginLeft: "10px", cursor: "pointer" }
};

export default BookingModal;
