import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import OfficeDashboard from "./OfficeDashboard";
import PublicMapView from "./PublicMapView"; // Make sure to import PublicMapView

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicMapView />} /> {/* Default route */}
        <Route path="/login" element={<Login />} />
        <Route path="/office-dashboard" element={<OfficeDashboard />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;