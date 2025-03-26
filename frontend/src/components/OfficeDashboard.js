import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

function OfficeDashboard() {
  const [slots, setSlots] = useState('');
  const [officeData, setOfficeData] = useState(null);

  // Connect to the Socket.io server
  const socket = io('https://findopendentist.onrender.com');

  useEffect(() => {
    socket.on('availabilityUpdated', (data) => {
      console.log('Availability updated:', data);
    });
    return () => socket.disconnect();
  }, [socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert comma-separated string to an array of slots
    const availableSlots = slots.split(',').map(s => s.trim());
    try {
      // In production, the officeId would come from authenticated user data
      const response = await axios.post('https://findopendentist.onrender.com/update-availability', { officeId: officeData?.id || 'YOUR_OFFICE_ID', availableSlots });
      setOfficeData(response.data);
      alert('Availability updated');
    } catch (error) {
      console.error(error);
      alert('Error updating availability');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Office Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Enter Available Slots (comma-separated, e.g., 2:00 PM, 3:30 PM):
        </label>
        <input 
          type="text" 
          value={slots} 
          onChange={(e) => setSlots(e.target.value)} 
          className="border p-2 m-2 w-full" 
        />
        <button type="submit" className="bg-green-500 text-white p-2 m-2 w-full">
          Update Availability
        </button>
      </form>
      {officeData && officeData.availableSlots && (
        <div>
          <h3 className="text-lg font-bold">Current Availability:</h3>
          <ul>
            {officeData.availableSlots.map((slot, index) => (
              <li key={index}>{slot}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OfficeDashboard;