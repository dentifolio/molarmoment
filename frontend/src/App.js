import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import Signup from './Signup';
import PublicMapView from './PublicMapView';
import OfficeDashboard from './OfficeDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<OfficeDashboard />} />
          <Route path="/" element={<PublicMapView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;