import React, { useState, useEffect, useRef } from 'react';
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
    lng: null,
  });

  const addressInputRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        { types: ['geocode'], componentRestrictions: { country: 'us' } }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address;
          setFormData((prev) => ({
            ...prev,
            address: formattedAddress,
            lat,
            lng,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            address: addressInputRef.current.value,
          }));
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === 'signup' ? '/signup' : '/login';
      const url = `https://findopendentist.onrender.com${endpoint}`;
      const response = await axios.post(url, formData);
      alert('Success: ' + JSON.stringify(response.data));
      if (mode === 'login') {
        localStorage.setItem('officeId', response.data.id);
      }
    } catch (error) {
      console.error(error);
      alert('Error during authentication');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === 'signup' ? 'Office Signup' : 'Office Login'}
      </h2>
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Office Name"
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              ref={addressInputRef}
              name="address"
              placeholder="Address"
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="website"
              placeholder="Website"
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="zipCode"
              placeholder="ZIP Code"
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {mode === 'signup' ? 'Sign Up' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default OfficeAuth;