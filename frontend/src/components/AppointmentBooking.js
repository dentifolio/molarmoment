import React, { useState } from 'react';
import axios from 'axios';

function AppointmentBooking({ office, slot, onClose }) {
  const [patientName, setPatientName] = useState('');
  const [contact, setContact] = useState('');
  const [reason, setReason] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
      setBookingConfirmed(true);
    } catch (error) {
      console.error(error);
      alert('Error booking appointment');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
        {bookingConfirmed ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Appointment Confirmed!</h2>
            <p className="mb-4">You're booked at <strong>{office.name}</strong> for <strong>{slot}</strong>.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Book an Appointment</h2>
            <p className="text-gray-700 mb-4">
              <strong>{office.name}</strong> — {slot}
            </p>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Info</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Visit</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  rows={3}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl"
              >
                Confirm Booking
              </button>
            </form>
            <button
              onClick={onClose}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;
