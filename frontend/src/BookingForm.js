import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = ({ officeId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://findopendentist.onrender.com/book/${officeId}`, formData);
      alert('Booking successful!');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      <label>Email</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      <label>Date</label>
      <input type="date" name="date" value={formData.date} onChange={handleChange} required />
      <label>Time</label>
      <input type="time" name="time" value={formData.time} onChange={handleChange} required />
      <button type="submit">Book Now</button>
    </form>
  );
};

export default BookingForm;