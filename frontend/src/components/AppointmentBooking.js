import React, { useState } from 'react';
import axios from 'axios';

function AppointmentBooking({ office, slot, onClose }) {
  const [patientName, setPatientName] = useState('');
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('');

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://findopendentist.onrender.com/book-slot', {
        officeId: office.id,
        slot,
        patientName,
        contact,
        reason,
      });
      alert('Appointment booked successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error booking appointment');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white rounded p-6 w-11/12 max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Book Appointment at {office.name}
        </h2>
        <p className="text-center mb-4">Time Slot: {slot}</p>
        <form onSubmit={handleBooking} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Contact Information"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Reason for Visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Book Appointment
          </button>
        </form>
        <button onClick={onClose} className="w-full mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AppointmentBooking;