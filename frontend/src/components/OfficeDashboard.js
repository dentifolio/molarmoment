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
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const socket = io('https://findopendentist.onrender.com');

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://findopendentist.onrender.com/active-offices');
        const office = res.data.find((o) => o.id === officeId);
        if (office && office.availableSlots) {
          setAvailableSlots(office.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`https://findopendentist.onrender.com/appointments?officeId=${officeId}`);
        setAppointments(res.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAvailability();
    fetchAppointments();

    socket.on('availabilityUpdated', (data) => {
      if (data.officeId === officeId && data.availableSlots) {
        setAvailableSlots(data.availableSlots);
      }
    });

    socket.on('appointmentBooked', (data) => {
      if (data.officeId === officeId) {
        setAppointments((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [officeId]);

  const toggleSlot = async (slot) => {
    let updatedSlots = availableSlots.includes(slot)
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
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Office Dashboard</h2>
      <p>Click a time slot to toggle its availability.</p>
      <div className="grid grid-cols-3 gap-4">
        {generateTimeSlots().map((slot) => (
          <button
            key={slot}
            onClick={() => toggleSlot(slot)}
            className={`m-2 p-2 ${availableSlots.includes(slot) ? 'bg-green-500' : 'bg-red-500'} text-white`}
          >
            {slot}
          </button>
        ))}
      </div>
      {confirmationMessage && <p className="mt-4 text-green-600">{confirmationMessage}</p>}

      <h3 className="text-lg font-bold mt-6">Booking Board</h3>
      <div className="mt-4">
        {appointments.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <ul>
            {appointments.map((appointment, index) => (
              <li key={index} className="mb-2 p-2 border rounded">
                <p><strong>Patient Name:</strong> {appointment.patientName}</p>
                <p><strong>Contact Information:</strong> {appointment.contactInfo}</p>
                <p><strong>Time Slot:</strong> {appointment.slot}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OfficeDashboard;