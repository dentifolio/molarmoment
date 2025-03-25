import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OfficeAuth from './components/OfficeAuth';
import OfficeDashboard from './components/OfficeDashboard';
import PatientSearch from './components/PatientSearch';

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-200">
        <Link to="/" className="m-2">Home</Link>
        <Link to="/login" className="m-2">Office Login</Link>
        <Link to="/signup" className="m-2">Office Signup</Link>
        <Link to="/dashboard" className="m-2">Office Dashboard</Link>
        <Link to="/search" className="m-2">Find a Dentist</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<OfficeAuth mode="login" />} />
        <Route path="/signup" element={<OfficeAuth mode="signup" />} />
        <Route path="/dashboard" element={<OfficeDashboard />} />
        <Route path="/search" element={<PatientSearch />} />
        <Route path="/" element={<PatientSearch />} />
      </Routes>
    </Router>
  );
}

export default App;