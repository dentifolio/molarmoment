import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './MapView';
import AppointmentBooking from './AppointmentBooking';
import { io } from 'socket.io-client';

function PatientSearch() {
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(5);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const socket = io('https://findopendentist.onrender.com');

  useEffect(() => {
    socket.on('availabilityUpdated', () => {
      fetchOffices();
    });
    return () => socket.disconnect();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await axios.get(
        `https://findopendentist.onrender.com/search-offices?zipCode=${zipCode}&radius=${radius}`
      );
      setOffices(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOffices();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Find an Open Dentist</h2>
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-2 sm:space-y-0 sm:space-x-4"
      >
        <input
          type="text"
          placeholder="ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        />
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/4"
        >
          <option value="1">1 mile</option>
          <option value="5">5 miles</option>
          <option value="10">10 miles</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full sm:w-auto">
          Search
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Available Offices</h3>
          <ul>
            {offices.map((office) => (
              <li key={office.id} className="border rounded p-4 mb-2 hover:shadow transition">
                <h4 className="font-bold text-lg">{office.name}</h4>
                <p className="text-sm">{office.address}</p>
                <p className="mt-2 font-semibold">Available Slots:</p>
                <ul className="mt-1 space-y-1">
                  {office.availableSlots &&
                    office.availableSlots.map((slot, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => {
                            setSelectedOffice(office);
                            setSelectedSlot(slot);
                          }}
                          className="text-blue-600 underline"
                        >
                          {slot}
                        </button>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <MapView
            offices={offices}
            onMarkerClick={(office, slot) => {
              setSelectedOffice(office);
              setSelectedSlot(slot);
            }}
          />
        </div>
      </div>
      {selectedOffice && selectedSlot && (
        <AppointmentBooking
          office={selectedOffice}
          slot={selectedSlot}
          onClose={() => {
            setSelectedOffice(null);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

export default PatientSearch;