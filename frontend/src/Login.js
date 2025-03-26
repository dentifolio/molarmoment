import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://findopendentist.onrender.com/login', formData);
      // If login is successful, the server returns an office object with 'id'
      if (response.data && response.data.id) {
        // Save the office ID so we know who is logged in
        localStorage.setItem('officeId', response.data.id);
        // Navigate straight to the dashboard
        navigate('/dashboard');
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to log in.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Office Login</h2>
      <label className="block mb-2">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        className="border p-2 mb-4 w-full"
      />
      <label className="block mb-2">Password</label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        className="border p-2 mb-4 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
        Login
      </button>
    </form>
  );
};

export default Login;