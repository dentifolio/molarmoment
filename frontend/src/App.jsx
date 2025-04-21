import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicMapView from './components/PublicMapView';
import OfficeLogin from './components/OfficeLogin';
import OfficeDashboard from './components/OfficeDashboard';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicMapView />} />
        <Route path="/login" element={<OfficeLogin />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <OfficeDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}
