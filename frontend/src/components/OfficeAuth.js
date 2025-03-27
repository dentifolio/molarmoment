import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function OfficeAuth({ mode }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    website: '',
    zipCode: '',
    lat: null,
    lng: null
  });

  const addressInputRef = useRef(null);

  useEffect(() => {
    // Wait until the address input ref is set and the google script is loaded
    if (addressInputRef.current && window.google) {
      // Ensure that the ref is indeed an HTMLInputElement
      if (!(addressInputRef.current instanceof HTMLInputElement)) {
        console.error("The address ref is not an HTMLInputElement:", addressInputRef.current);
        return;
      }
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['geocode'], // restrict to addresses
          componentRestrictions: { country: 'us' } // optional: restrict to specific country
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address;
          setFormData(prev => ({
            ...prev,
            address: formattedAddress,
            lat,
            lng
          }));
        } else {
          // Fallback in case geometry isn't available
          setFormData(prev => ({
            ...prev,
            address: addressInputRef.current.value
          }));
        }
      });
    }
  }, [addressInputRef.current]); // The effect will run when the ref is attached

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Replace the URL with your backend endpoint
    const endpoint = mode === 'signup' ? '/signup' : '/login';
    try {
      const response = await axios.post(`https://findopendentist.onrender.com${endpoint}`, formData);
      alert('Success: ' + JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
      alert('Error during authentication');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      {mode === 'signup' && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Office Name"
            onChange={handleChange}
            className="border p-2 m-2 w-full"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="border p-2 m-2 w-full"
          />
          {/* This input will use Google Places Autocomplete */}
          <input
            type="text"
            ref={addressInputRef}
            name="address"
            placeholder="Address"
            onChange={handleChange}
            className="border p-2 m-2 w-full"
          />
          <input
            type="text"
            name="website"
            placeholder="Website"
            onChange={handleChange}
            className="border p-2 m-2 w-full"
          />
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            onChange={handleChange}
            className="border p-2 m-2 w-full"
          />
        </>
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="border p-2 m-2 w-full"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="border p-2 m-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 m-2 w-full">
        {mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>
    </form>
  );
}

export default OfficeAuth;
