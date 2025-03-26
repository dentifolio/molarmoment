import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { generateTimeSlots } from '../utils/timeSlots';
import { Navigate } from 'react-router-dom';

function OfficeDashboard() {
  // Check for authentication: officeId is stored after login.
  const storedOfficeId = localStorage.getItem('officeId');
  if (!storedOfficeId) {
    // Redirect to login if not logged in.
    return <Navigate to="/login" replace />;
  }

  const [officeId, setOfficeId] = useState(storedOfficeId);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate time slots (e.g., 9:00 AM to 5:00 PM, every 30 minutes).
  const allTimeSlots = generateTimeSlots(9, 17, 30);

  // Connect to Socket.io (replace URL if needed).
  const socket = io('https://findopendentist.onrender.com');

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      try {
        const res = await axios.get('https://findopendentist.onrender.com/active-offices');
        const office = res.data.find((o) => o.id === storedOfficeId);
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
  }, [storedOfficeId]);

  useEffect(() => {
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

  // Toggle a time slot's availability and update the backend.
  const toggleSlot = async (slot) => {
    let updatedSlots = [];
    if (availableSlots.includes(slot)) {
      updatedSlots = availableSlots.filter((s) => s !== slot);
    } else {
      updatedSlots = [...availableSlots, slot];
    }
    // Optimistically update the UI.
    setAvailableSlots(updatedSlots);
    try {
      await axios.post('https://findopendentist.onrender.com/update-availability', {
        officeId,
        availableSlots: updatedSlots,
      });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Office Dashboard</h2>
      <p className="mb-4 text-center">Click a time slot to toggle its availability.</p>
      <div className="grid grid-cols-3 gap-2">
        {allTimeSlots.map((slot) => {
          const isAvailable = availableSlots.includes(slot);
          return (
            <button
              key={slot}
              onClick={() => toggleSlot(slot)}
              className={`p-2 border rounded transition ${
                isAvailable ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm">
        Selected slots automatically update for patients.
      </p>
    </div>
  );
}

export default OfficeDashboard;