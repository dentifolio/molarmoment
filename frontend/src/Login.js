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
      // Check if the response has an office id
      if (response.data && response.data.id) {
        // Optionally store the office id for later use (e.g., in localStorage)
        localStorage.setItem('officeId', response.data.id);
        navigate('/dashboard');
      } else {
        alert('Login failed: Invalid credentials.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to log in.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow rounded">
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
      <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
        Login
      </button>
    </form>
  );
};

export default Login;