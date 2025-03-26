import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import OfficeAuth from './components/OfficeAuth';
import OfficeDashboard from './components/OfficeDashboard';
import PatientSearch from './components/PatientSearch';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<PatientSearch />} />
          <Route path="/signup" element={<OfficeAuth mode="signup" />} />
          <Route path="/login" element={<OfficeAuth mode="login" />} />
          <Route path="/dashboard" element={<OfficeDashboard />} />
          <Route path="/search" element={<PatientSearch />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;