// Upgraded OfficeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../firebase';

const hours = Array.from({ length: 20 }, (_, i) => 7 + i); // 7am to 2am

function OfficeDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [availability, setAvailability] = useState({});
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await currentUser.getIdToken();
      const profileRes = await fetch(`${apiUrl}/api/office/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      setProfile(profileData);
      setAvailability(profileData.availability || {});

      const bookingsRes = await fetch(`${apiUrl}/api/office/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const toggleSlot = async (hour) => {
    const newAvailability = { ...availability, [hour]: !availability[hour] };
    setAvailability(newAvailability);
    const token = await currentUser.getIdToken();
    await fetch(`${apiUrl}/api/office/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newAvailability)
    });
  };

  const updateProfile = async () => {
    const token = await currentUser.getIdToken();
    await fetch(`${apiUrl}/api/office/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl mb-2">Profile</h2>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={updateProfile} className="px-4 py-2 bg-blue-600 text-white rounded">
            Update Profile
          </button>
        </div>
        <div className="p-4 border rounded">
          <h2 className="text-xl mb-2">Select Available Time Slots</h2>
          <div className="grid grid-cols-4 gap-2">
            {hours.map(hour => (
              <button
                key={hour}
                onClick={() => toggleSlot(hour)}
                className={`p-2 rounded text-sm ${availability[hour] ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                {hour}:00
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl mb-2">Bookings</h2>
        {bookings.map(booking => (
          <div key={booking.id} className="p-2 border-b">
            <p>{booking.name} - {booking.reason}</p>
            <p>{new Date(booking.timestamp?.seconds * 1000).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfficeDashboard;
