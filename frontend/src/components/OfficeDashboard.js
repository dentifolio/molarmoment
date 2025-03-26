import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { generateTimeSlots } from '../utils/timeSlots';

function OfficeDashboard() {
  const [officeId, setOfficeId] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const allTimeSlots = generateTimeSlots(9, 17, 30);
  const socket = io('https://findopendentist.onrender.com');

  useEffect(() => {
    const storedOfficeId = localStorage.getItem('officeId') || 'Rs4bjoR16ZQIvkSHEtWK';
    setOfficeId(storedOfficeId);

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
  }, []);

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
      <p className="mt-4 text-center text-sm">Selected slots automatically update for patients.</p>
    </div>
  );
}

export default OfficeDashboard;