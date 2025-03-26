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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-4 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Book Appointment at {office.name}</h2>
        <p>Time Slot: {slot}</p>
        <form onSubmit={handleBooking}>
          <input 
            type="text" 
            placeholder="Your Name" 
            value={patientName} 
            onChange={(e) => setPatientName(e.target.value)} 
            className="border p-2 m-2 w-full"
          />
          <input 
            type="text" 
            placeholder="Contact Information" 
            value={contact} 
            onChange={(e) => setContact(e.target.value)} 
            className="border p-2 m-2 w-full"
          />
          <textarea 
            placeholder="Reason for Visit" 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            className="border p-2 m-2 w-full"
          ></textarea>
          <button type="submit" className="bg-blue-500 text-white p-2 m-2 w-full">
            Book Appointment
          </button>
        </form>
        <button onClick={onClose} className="bg-red-500 text-white p-2 m-2 w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AppointmentBooking;