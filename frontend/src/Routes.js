import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicMapView from "./PublicMapView";
import OfficeDashboard from "./OfficeDashboard";
import Login from "./Login";
import Signup from "./Signup";

const AppRoutes = ({ isLoggedIn, user, onLogin }) => {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <OfficeDashboard user={user} /> : <PublicMapView />} />
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default AppRoutes;
