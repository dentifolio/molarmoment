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
    // Listen for real-time updates
    socket.on('availabilityUpdated', (data) => {
      if (data.officeId === officeId && data.availableSlots) {
        setAvailableSlots(data.availableSlots);
      }
    });
    socket.on('appointmentBooked', (data) => {
      if (data.officeId === officeId) {
        alert(`New appointment booked by ${data.patientName} for ${data.slot}`);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Office Dashboard</h2>
      <p>Click a time slot to toggle its availability.</p>
      {availableSlots.map((slot) => (
        <button
          key={slot}
          onClick={() => toggleSlot(slot)}
          className={`m-2 p-2 ${availableSlots.includes(slot) ? 'bg-green-500' : 'bg-red-500'} text-white`}
        >
          {slot}
        </button>
      ))}
      {confirmationMessage && <p className="mt-4 text-green-600">{confirmationMessage}</p>}
    </div>
  );
};

export default OfficeDashboard;