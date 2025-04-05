import React from 'react';
import AppointmentForm from './AppointmentForm';
import './App.css';  // Add CSS for styling

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Book a Dental Appointment</h1>
      </header>
      <main>
        <AppointmentForm />
      </main>
      <footer className="App-footer">
        <p>&copy; 2025 Dentifolio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;