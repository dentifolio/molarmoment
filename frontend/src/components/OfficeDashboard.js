import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Navigate } from 'react-router-dom';

// Utility to generate time slots from 9:00 AM to 5:00 PM every 30 min
function generateTimeSlots(startHour = 9, endHour = 17, interval = 30) {
  const slots = [];
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const hours = current.getHours();
    const minutes = current.getMinutes();
    slots.push(formatTime(hours, minutes));
    current.setMinutes(current.getMinutes() + interval);
  }
  return slots;
}

function formatTime(hours, minutes) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 || 12;
  const minString = minutes.toString().padStart(2, '0');
  return `${twelveHour}:${minString} ${ampm}`;
}

const OfficeDashboard = () => {
  // Check if user is logged in
  const storedOfficeId = localStorage.getItem('officeId');
  if (!storedOfficeId) {
    return <Navigate to="/login" replace />;
  }

  const [officeId] = useState(storedOfficeId);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate a list of time slots
  const allTimeSlots = generateTimeSlots();

  // Socket.io
  const socket = io('https://findopendentist.onrender.com');

  useEffect(() => {
    // Fetch current availability
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

  // Toggle a slot's availability
  const toggleSlot = async (slot) => {
    let updatedSlots = [];
    if (availableSlots.includes(slot)) {
      // Remove slot
      updatedSlots = availableSlots.filter((s) => s !== slot);
    } else {
      // Add slot
      updatedSlots = [...availableSlots, slot];
    }
    // Optimistically update UI
    setAvailableSlots(updatedSlots);

    // Notify backend
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
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Office Dashboard</h2>
      <p>Click a time slot to toggle its availability.</p>
      <div className="grid grid-cols-3 gap-2 mt-4">
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
      <p className="mt-4">Selected slots automatically update for patients.</p>
    </div>
  );
};

export default OfficeDashboard;