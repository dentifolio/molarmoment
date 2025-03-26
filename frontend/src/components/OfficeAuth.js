import React, { useState } from 'react';
import axios from 'axios';

function OfficeAuth({ mode }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    website: '',
    zipCode: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === 'signup' ? '/signup' : '/login';
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
          <input type="text" name="name" placeholder="Name" onChange={handleChange} className="border p-2 m-2 w-full" />
          <input type="text" name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 m-2 w-full" />
          <input type="text" name="address" placeholder="Address" onChange={handleChange} className="border p-2 m-2 w-full" />
          <input type="text" name="website" placeholder="Website" onChange={handleChange} className="border p-2 m-2 w-full" />
          <input type="text" name="zipCode" placeholder="ZIP Code" onChange={handleChange} className="border p-2 m-2 w-full" />
        </>
      )}
      <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border p-2 m-2 w-full" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 m-2 w-full" />
      <button type="submit" className="bg-blue-500 text-white p-2 m-2 w-full">
        {mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>
    </form>
  );
}

export default OfficeAuth;