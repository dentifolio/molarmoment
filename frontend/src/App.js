import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import OfficeDashboard from './components/OfficeDashboard';
import PatientSearch from './components/PatientSearch';  // Updated import

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<OfficeDashboard />} />
        <Route path="/search" element={<PatientSearch />} />  // Updated route
      </Routes>
    </Router>
  );
};

export default App;