import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Prepare signup payload (exclude confirmPassword)
    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      // Optionally add other fields here if needed (e.g., phone, address, etc.)
    };

    try {
      const response = await axios.post('https://findopendentist.onrender.com/signup', signupData);
      console.log('Signup response:', response.data);
      // Check for the existence of an ID to determine success
      if (response.data && response.data.id) {
        // Optionally, store the office ID for authentication purposes
        localStorage.setItem('officeId', response.data.id);
        navigate('/dashboard');
      } else {
        alert('Signup failed');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Failed to sign up.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <label className="block mb-2">Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border p-2 mb-4 rounded"
      />
      <label className="block mb-2">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full border p-2 mb-4 rounded"
      />
      <label className="block mb-2">Password</label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full border p-2 mb-4 rounded"
      />
      <label className="block mb-2">Confirm Password</label>
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        className="w-full border p-2 mb-4 rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Sign Up
      </button>
    </form>
  );
};

export default Signup;