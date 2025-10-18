import React, { useEffect, useState } from 'react';
import { auth, db } from '../App';
import { signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

export default function OfficeDashboard() {
  const officeId = auth.currentUser.uid;
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [officeInfo, setOfficeInfo] = useState({
    name: '',
    address: '',
    phone: '',
    lat: '',
    lng: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('availability'); // 'availability' or 'bookings'

  useEffect(() => {
    // Load office information
    const loadOfficeInfo = async () => {
      const officeDoc = await getDoc(doc(db, 'offices', officeId));
      if (officeDoc.exists()) {
        const data = officeDoc.data();
        setOfficeInfo({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          lat: data.lat || '',
          lng: data.lng || '',
        });
      }
    };
    loadOfficeInfo();

    // Listen to availability changes
    const availRef = collection(db, 'offices', officeId, 'availability');
    const unsubAvail = onSnapshot(availRef, (snap) => {
      setSlots(snap.docs.map((d) => ({ time: d.id })));
    });

    // Listen to bookings changes
    const bookingsRef = collection(db, 'offices', officeId, 'bookings');
    const unsubBookings = onSnapshot(bookingsRef, (snap) => {
      const bookingsList = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setBookings(bookingsList);
    });

    return () => {
      unsubAvail();
      unsubBookings();
    };
  }, [officeId]);

  const toggleSlot = async (time) => {
    const slotRef = doc(db, 'offices', officeId, 'availability', time);
    if (slots.find((s) => s.time === time)) {
      await deleteDoc(slotRef);
    } else {
      await setDoc(slotRef, { available: true });
    }
  };

  const saveProfile = async () => {
    try {
      await updateDoc(doc(db, 'offices', officeId), {
        name: officeInfo.name,
        address: officeInfo.address,
        phone: officeInfo.phone,
        lat: parseFloat(officeInfo.lat) || 0,
        lng: parseFloat(officeInfo.lng) || 0,
      });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const times = getTodayTimes();

  const isSlotBooked = (time) => {
    return bookings.some((b) => b.slot === time);
  };

  const getBookingForSlot = (time) => {
    return bookings.find((b) => b.slot === time);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                Office Dashboard
              </h1>
              <p className="text-gray-600 mt-1">{officeInfo.name || 'Your Dental Office'}</p>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Office Profile</h2>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Name
                </label>
                <input
                  type="text"
                  value={officeInfo.name}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={officeInfo.phone}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={officeInfo.address}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Name:</strong> {officeInfo.name || 'Not set'}</p>
              <p><strong>Address:</strong> {officeInfo.address || 'Not set'}</p>
              <p><strong>Phone:</strong> {officeInfo.phone || 'Not set'}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('availability')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'availability'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Availability
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Bookings ({bookings.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'availability' ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Manage Available Time Slots
                </h2>
                <p className="text-gray-600 mb-4">
                  Click on time slots to toggle availability. Green = available, Gray = unavailable
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {times.map((time) => {
                    const isAvailable = slots.find((s) => s.time === time);
                    const isBooked = isSlotBooked(time);
                    const booking = getBookingForSlot(time);

                    return (
                      <button
                        key={time}
                        onClick={() => !isBooked && toggleSlot(time)}
                        disabled={isBooked}
                        className={`p-3 rounded-md text-sm font-medium transition-colors ${
                          isBooked
                            ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                            : isAvailable
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                        title={isBooked ? `Booked by ${booking?.patientName}` : ''}
                      >
                        {new Date(Number(time)).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isBooked && <div className="text-xs mt-1">Booked</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Today's Bookings</h2>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 italic">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings
                      .sort((a, b) => Number(a.slot) - Number(b.slot))
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">{booking.patientName}</p>
                              <p className="text-gray-600 text-sm mt-1">
                                ⏰ {new Date(Number(booking.slot)).toLocaleString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {booking.patientEmail && (
                                <p className="text-gray-600 text-sm">
                                  ✉️ {booking.patientEmail}
                                </p>
                              )}
                              {booking.patientPhone && (
                                <p className="text-gray-600 text-sm">
                                  📞 {booking.patientPhone}
                                </p>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTodayTimes() {
  const arr = [];
  const start = new Date();
  start.setHours(8, 0, 0, 0);
  for (let i = 0; i < 40; i++) {
    arr.push((start.getTime() + i * 15 * 60 * 1000).toString());
  }
  return arr;
}
