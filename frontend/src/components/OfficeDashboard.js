import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Navigate } from 'react-router-dom';

const OfficeDashboard = () => {
  // Check if user is logged in by looking for an officeId in localStorage
  const storedOfficeId = localStorage.getItem('officeId');
  if (!storedOfficeId) {
    // If not logged in, redirect to /login
    return <Navigate to="/login" replace />;
  }

  const [officeId] = useState(storedOfficeId);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [appointments, setAppointments] = useState([]);

  // Socket.io connection
  const socket = io('https://findopendentist.onrender.com');

  useEffect(() => {
    async function fetchAvailability() {
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
    }
    fetchAvailability();
  }, [officeId]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get(`https://findopendentist.onrender.com/appointments?officeId=${officeId}`);
        setAppointments(res.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }

    fetchAppointments();

    // Listen for real-time updates
    socket.on('availabilityUpdated', (data) => {
      if (data.officeId === officeId && data.availableSlots) {
        setAvailableSlots(data.availableSlots);
      }
    });

    socket.on('appointmentBooked', (data) => {
      if (data.officeId === officeId) {
        setAppointments((prevAppointments) => [...prevAppointments, data]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [officeId, socket]);

  const toggleSlot = async (slot) => {
    let updatedSlots = [];
    if (availableSlots.includes(slot)) {
      updatedSlots = availableSlots.filter((s) => s !== slot);
    } else {
      updatedSlots = [...availableSlots, slot];
    }
    setAvailableSlots(updatedSlots);

    try {
      await axios.post('https://findopendentist.onrender.com/update-availability', {
        officeId,
        availableSlots: updatedSlots,
      });
      setConfirmationMessage('Availability updated successfully!');
      setTimeout(() => setConfirmationMessage(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const generateTimeSlots = () => {
    const startHour = 5; // 5 AM
    const endHour = 20; // 8 PM
    const slots = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      const timeString = hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`;
      slots.push(timeString);
    }

    return slots;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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