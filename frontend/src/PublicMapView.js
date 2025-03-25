import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const PublicMapView = () => {
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await axios.get('https://findopendentist.onrender.com/offices');
      console.log('Fetched Offices:', response.data); // Debugging log
      setOffices(response.data);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  const handleBookSlot = async (officeId, slot) => {
    try {
      await axios.post('https://findopendentist.onrender.com/book-slot', {
        officeId,
        slot,
      });
      // Refresh office data
      fetchOffices();
      alert('Slot booked successfully!');
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('Error booking slot.');
    }
  };

  const formatTimeTo12Hour = (time) => {
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const formattedHour = hourInt % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full h-[300px] md:h-[450px] mt-16">
        <LoadScript googleMapsApiKey="AIzaSyDGBHVURcrUdjYNhCDNjFBWawsv612pQU0">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '600px' }}
            center={{ lat: 41.3851, lng: 2.1734 }}
            zoom={12}
            onLoad={(map) => (mapRef.current = map)}
          >
            {offices.map((office) =>
              office.location ? (
                <Marker
                  key={office.id}
                  position={office.location}
                  onClick={() => setSelectedOffice(office)}
                />
              ) : null
            )}

            {searchedLocation && (
              <Marker
                position={searchedLocation}
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
              />
            )}

            {selectedOffice && selectedOffice.location && (
              <InfoWindow
                position={selectedOffice.location}
                onCloseClick={() => setSelectedOffice(null)}
              >
                <div>
                  <h3 className="font-bold">{selectedOffice.name}</h3>
                  <p className="text-sm">{selectedOffice.address}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedOffice.availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => handleBookSlot(selectedOffice.id, slot)}
                      >
                        {formatTimeTo12Hour(slot)}
                      </button>
                    ))}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="px-4 py-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Find Available Appointments</h2>
          <p className="mb-4 text-sm text-gray-600">
            Enter your ZIP code and search radius below to find dentists with open slots.
          </p>

          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            >
              <option value="">Select Radius</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMapView;
