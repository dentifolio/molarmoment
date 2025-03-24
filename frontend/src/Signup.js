import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    try {
      const response = await axios.post('https://findopendentist.onrender.com/signup', formData);
      if (response.data.success) {
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
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      <label>Email</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      <label>Password</label>
      <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      <label>Confirm Password</label>
      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
