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
        .then(data => setOffices(data));
    }
  }, [zipCode, radius]);

  // Rest of the component remains the same
  // ... (previous MapView code)
}

export default MapView;