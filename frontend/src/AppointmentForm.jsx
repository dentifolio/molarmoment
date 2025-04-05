import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentForm = () => {
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [date, setDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');

  // Fetch dentist data when component mounts
  useEffect(() => {
    axios.get('/api/dentists')
      .then(response => {
        setDentists(response.data);
      })
      .catch(err => console.error('Error fetching dentists:', err));
  }, []);

  // Update available time slots when the selected dentist or date changes
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
        // Refresh dentist data after a successful booking
        return axios.get('/api/dentists');
      })
      .then(response => setDentists(response.data))
      .catch(error => {
        setMessage(error.response?.data?.message || 'Error booking appointment.');
      });
  };

  return (
    <div>
      <h1>Book a Dental Appointment</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
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
        <div>
          <label>Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
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
        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
};

export default AppointmentForm;
