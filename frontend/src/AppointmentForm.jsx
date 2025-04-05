import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AppointmentForm.css';  // Add CSS for styling

const AppointmentForm = () => {
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [date, setDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/dentists')
      .then(response => {
        setDentists(response.data);
      })
      .catch(err => console.error('Error fetching dentists:', err));
  }, []);

  useEffect(() => {
    if (selectedDentist && date) {
      const dentist = dentists.find(d => d.id === selectedDentist);
      if (dentist && dentist.availability[date]) {
        setAvailableTimes(dentist.availability[date]);
      } else {
        setAvailableTimes([]);
      }
    }
  }, [selectedDentist, date, dentists]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/appointments', { dentistId: selectedDentist, date, time: selectedTime })
      .then(response => {
        setMessage(response.data.message);
        return axios.get('/api/dentists');
      })
      .then(response => setDentists(response.data))
      .catch(error => {
        setMessage(error.response?.data?.message || 'Error booking appointment.');
      });
  };

  return (
    <div className="appointment-form">
      <h2>Book a Dental Appointment</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Dentist:</label>
          <select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
          >
            <option value="">-- Select Dentist --</option>
            {dentists.map(dentist => (
              <option key={dentist.id} value={dentist.id}>
                {dentist.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Select Time Slot:</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">-- Select Time Slot --</option>
            {availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">Book Appointment</button>
      </form>
    </div>
  );
};

export default AppointmentForm;