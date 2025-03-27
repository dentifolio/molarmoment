import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import './App.css'; // Assuming you have some global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* Add other routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;