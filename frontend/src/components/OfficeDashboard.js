import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Navigate } from 'react-router-dom';

const OfficeDashboard = () => {
  const storedOfficeId = localStorage.getItem('officeId');
  if (!storedOfficeId) {
    return <Navigate to="/login" replace />;
  }

  const officeId = storedOfficeId;
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    const socket = io('https://findopendentist.onrender.com');

    const fetchOfficeData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://findopendentist.onrender.com/active-offices');
        const office = res.data.find((o) => o.id === officeId);
        if (office) {
          setAvailableSlots(office.availableSlots || []);
          const sortedAppointments = (office.bookedAppointments || []).sort((a, b) => {
            const timeA = new Date(a.bookedAt);
            const timeB = new Date(b.bookedAt);
            return timeA - timeB;
          });
          setBookedAppointments(sortedAppointments);
        }
      } catch (error) {
        console.error('Error fetching office data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeData();

    socket.on('availabilityUpdated', (data) => {
      if (data.officeId === officeId && data.availableSlots) {
        setAvailableSlots(data.availableSlots);
      }
    });

    socket.on('appointmentBooked', (data) => {
      if (data.officeId === officeId) {
        setBookedAppointments((prev) => [...prev, data].sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt)));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [officeId]);

  const toggleSlot = async (slot) => {
    const updatedSlots = availableSlots.includes(slot)
      ? availableSlots.filter((s) => s !== slot)
      : [...availableSlots, slot];

    setAvailableSlots(updatedSlots);

    try {
      await axios.post('https://findopendentist.onrender.com/update-availability', {
        officeId,
        availableSlots: updatedSlots,
      });
      setConfirmationMessage('Availability updated successfully!');
      setTimeout(() => setConfirmationMessage(''), 3000);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 20; hour++) {
      const timeString = hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`;
      slots.push(timeString);
    }
    return slots;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Office Dashboard</h2>

      {confirmationMessage && (
        <div className="bg-green-100 text-green-800 p-2 rounded mb-4">
          {confirmationMessage}
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">Manage Availability</h3>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {generateTimeSlots().map((slot) => (
          <button
            key={slot}
            className={`p-2 rounded-lg border text-sm font-medium ${
              availableSlots.includes(slot)
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => toggleSlot(slot)}
          >
            {slot}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Booked Appointments</h3>
      {bookedAppointments.length === 0 ? (
        <p className="text-gray-500">No appointments booked yet.</p>
      ) : (
        <ul className="space-y-3">
          {bookedAppointments.map((appt, index) => (
            <li key={index} className="border p-3 rounded-lg shadow">
              <p className="font-medium">{appt.patientName}</p>
              <p className="text-sm text-gray-600">Time: {appt.slot}</p>
              <p className="text-sm text-gray-600">Contact: {appt.contact}</p>
              {appt.reason && <p className="text-sm text-gray-600">Reason: {appt.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OfficeDashboard;
