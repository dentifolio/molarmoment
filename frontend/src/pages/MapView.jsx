import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { apiUrl } from '../firebase';
import BookingModal from '../components/BookingModal';

function MapView() {
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState(10);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);

  const mapStyles = { height: "50vh", width: "100%" };
  const defaultCenter = { lat: 37.0902, lng: -95.7129 };

  useEffect(() => {
    if (zipCode) {
      fetch(`${apiUrl}/api/offices?zip=${zipCode}&radius=${radius}`)
        .then(res => res.json())
        .then(data => setOffices(data))
        .catch(err => console.error('Error fetching offices:', err));
    }
  }, [zipCode, radius]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
          </div>
          <div className="space-y-2">
            {offices.map(office => (
              <div
                key={office.id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedOffice(office)}
              >
                <h3>{office.name}</h3>
                <p>{office.address}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="md:w-2/3">
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={mapStyles} zoom={10} center={defaultCenter}>
              {offices.map(office => (
                <Marker
                  key={office.id}
                  position={{ lat: office.lat, lng: office.lng }}
                  onClick={() => setSelectedOffice(office)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
      {selectedOffice && (
        <BookingModal office={selectedOffice} onClose={() => setSelectedOffice(null)} />
      )}
    </div>
  );
}

export default MapView;