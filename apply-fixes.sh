#!/bin/bash

# Automated Fix Script for MolarMoment / FindOpenDentist
# This script will backup your code and apply all fixes

set -e  # Exit on any error

echo "================================================"
echo "  MolarMoment - Automated Fix Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository root. Please run this from molarmoment directory."
    exit 1
fi

# Create backup
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
if [ -d "backend" ]; then
    cp -r backend "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -d "frontend" ]; then
    cp -r frontend "$BACKUP_DIR/" 2>/dev/null || true
fi
echo "✅ Backup created"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p backend
mkdir -p frontend/src/components
echo "✅ Directory structure ready"
echo ""

# ============================================
# BACKEND FILES
# ============================================

echo "🔧 Writing backend/server.js..."
cat > backend/server.js << 'BACKEND_SERVER_EOF'
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Fetch all offices and their slots
app.get('/api/offices', async (req, res) => {
  try {
    const officesSnap = await db.collection('offices').get();
    const data = [];

    for (const doc of officesSnap.docs) {
      const officeData = doc.data();
      const office = {
        id: doc.id,
        name: officeData.name || 'Unnamed Office',
        address: officeData.address || '',
        phone: officeData.phone || '',
        lat: officeData.lat || 0,
        lng: officeData.lng || 0
      };

      const availSnap = await db
        .collection('offices')
        .doc(doc.id)
        .collection('availability')
        .get();

      const bookingsSnap = await db
        .collection('offices')
        .doc(doc.id)
        .collection('bookings')
        .get();

      const booked = bookingsSnap.docs.map((b) => b.data().slot);

      office.slots = availSnap.docs.map((a) => ({
        time: a.id,
        booked: booked.includes(a.id),
      }));

      data.push(office);
    }

    res.json(data);
  } catch (e) {
    console.error('Error fetching offices:', e);
    res.status(500).json({ error: 'Error fetching offices' });
  }
});

// Book a slot
app.post('/api/book', async (req, res) => {
  const { officeId, time, patientName, patientEmail, patientPhone } = req.body;

  if (!officeId || !time || !patientName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const availRef = db
      .collection('offices')
      .doc(officeId)
      .collection('availability')
      .doc(time);

    const docSnap = await availRef.get();
    if (!docSnap.exists) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    const bookingsRef = db
      .collection('offices')
      .doc(officeId)
      .collection('bookings');

    const existingBooking = await bookingsRef
      .where('slot', '==', time)
      .get();

    if (!existingBooking.empty) {
      return res.status(400).json({ error: 'Slot already booked' });
    }

    await bookingsRef.add({
      slot: time,
      patientName,
      patientEmail: patientEmail || '',
      patientPhone: patientPhone || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: 'Booking confirmed' });
  } catch (e) {
    console.error('Error booking slot:', e);
    res.status(500).json({ error: 'Error booking slot' });
  }
});

// Get bookings for an office
app.get('/api/offices/:officeId/bookings', async (req, res) => {
  const { officeId } = req.params;

  try {
    const bookingsSnap = await db
      .collection('offices')
      .doc(officeId)
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = bookingsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));

    res.json(bookings);
  } catch (e) {
    console.error('Error fetching bookings:', e);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Update office profile
app.put('/api/offices/:officeId', async (req, res) => {
  const { officeId } = req.params;
  const { name, address, phone, lat, lng } = req.body;

  try {
    await db.collection('offices').doc(officeId).set({
      name,
      address,
      phone,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ success: true });
  } catch (e) {
    console.error('Error updating office:', e);
    res.status(500).json({ error: 'Error updating office' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
BACKEND_SERVER_EOF

echo "🔧 Writing backend/package.json..."
cat > backend/package.json << 'BACKEND_PKG_EOF'
{
  "name": "findopendentist-backend",
  "version": "0.1.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "firebase-admin": "^11.10.1",
    "dotenv": "^16.0.3"
  }
}
BACKEND_PKG_EOF

echo "🔧 Writing backend/.env.example..."
cat > backend/.env.example << 'BACKEND_ENV_EOF'
FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}
PORT=4000
BACKEND_ENV_EOF

# ============================================
# FRONTEND FILES
# ============================================

echo "🔧 Writing frontend/package.json..."
cat > frontend/package.json << 'FRONTEND_PKG_EOF'
{
  "name": "findopendentist-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "firebase": "^10.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "vite": "^4.3.9"
  }
}
FRONTEND_PKG_EOF

echo "🔧 Writing frontend/vite.config.js..."
cat > frontend/vite.config.js << 'VITE_CONFIG_EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
VITE_CONFIG_EOF

echo "🔧 Writing frontend/.env.example..."
cat > frontend/.env.example << 'FRONTEND_ENV_EOF'
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
FRONTEND_ENV_EOF

echo "🔧 Writing frontend/src/main.jsx..."
cat > frontend/src/main.jsx << 'MAIN_JSX_EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
MAIN_JSX_EOF

echo "🔧 Writing frontend/src/index.css..."
cat > frontend/src/index.css << 'INDEX_CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
INDEX_CSS_EOF

echo "🔧 Writing frontend/index.html..."
cat > frontend/index.html << 'INDEX_HTML_EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Find Open Dentist</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
INDEX_HTML_EOF

echo "🔧 Writing frontend/src/App.jsx..."
cat > frontend/src/App.jsx << 'APP_JSX_EOF'
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
APP_JSX_EOF

# This file is too long, splitting into part 2...
echo "🔧 Writing frontend/src/components/PublicMapView.jsx..."
cat > frontend/src/components/PublicMapView.jsx << 'PUBLICMAP_EOF'
import React, { useEffect, useState } from 'react';

export default function PublicMapView() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = () => {
    setLoading(true);
    fetch('/api/offices')
      .then((res) => res.json())
      .then((data) => {
        setOffices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching offices:', err);
        setLoading(false);
      });
  };

  const handleBookSlot = (office, slot) => {
    setSelectedOffice(office);
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!patientName.trim()) {
      alert('Please enter your name');
      return;
    }

    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officeId: selectedOffice.id,
        time: selectedSlot.time,
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Booking confirmed!');
          setShowBookingModal(false);
          setPatientName('');
          setPatientEmail('');
          setPatientPhone('');
          fetchOffices();
        } else {
          alert(data.error || 'Booking failed');
        }
      })
      .catch((err) => {
        console.error('Error booking:', err);
        alert('Error booking slot');
      });
  };

  const getAvailableSlots = (slots) => {
    return slots.filter(slot => !slot.booked);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading available dentists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Find Open Dentist
          </h1>
          <p className="text-gray-600">
            Book same-day dental appointments near you
          </p>
        </header>

        {offices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No dental offices available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offices.map((office) => {
              const availableSlots = getAvailableSlots(office.slots);

              return (
                <div
                  key={office.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      {office.name}
                    </h2>
                    {office.address && (
                      <p className="text-gray-600 text-sm mb-1">
                        📍 {office.address}
                      </p>
                    )}
                    {office.phone && (
                      <p className="text-gray-600 text-sm">
                        📞 {office.phone}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Available Today ({availableSlots.length} slots)
                    </h3>
                  </div>

                  {availableSlots.length === 0 ? (
                    <p className="text-gray-400 italic">
                      No slots available today
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.slice(0, 9).map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => handleBookSlot(office, slot)}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          {new Date(Number(slot.time)).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </button>
                      ))}
                      {availableSlots.length > 9 && (
                        <div className="col-span-3 text-center text-sm text-gray-500 mt-1">
                          +{availableSlots.length - 9} more slots
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>

              <div className="mb-4">
                <p className="text-gray-600 mb-1">
                  <strong>{selectedOffice?.name}</strong>
                </p>
                <p className="text-gray-600">
                  {new Date(Number(selectedSlot?.time)).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setPatientName('');
                    setPatientEmail('');
                    setPatientPhone('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
PUBLICMAP_EOF

# Continue with remaining component files...
echo "⏳ This may take a moment..."

cat > frontend/src/components/OfficeLogin.jsx << 'OFFICELOGIN_EOF'
import React, { useState } from 'react';
import { auth, db } from '../App';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function OfficeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !officeName) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'offices', userId), {
        name: officeName,
        email: email,
        address: '',
        phone: '',
        lat: 0,
        lng: 0,
        createdAt: new Date().toISOString(),
      });

      navigate('/dashboard');
    } catch (e) {
      console.error('Signup error:', e);
      setError(e.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Find Open Dentist
          </h1>
          <p className="text-gray-600">
            {isSignup ? 'Create your office account' : 'Office Portal Login'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Name *
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Dental Office"
                  required={isSignup}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="office@example.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {isSignup && (
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isSignup
                ? 'Already have an account? Login'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to public booking page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
OFFICELOGIN_EOF

# The OfficeDashboard component is very long, so we'll write it separately
cat > frontend/src/components/OfficeDashboard.jsx << 'OFFICEDASH_EOF'
import React, { useEffect, useState } from 'react';
import { auth, db } from '../App';
import { signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

export default function OfficeDashboard() {
  const officeId = auth.currentUser.uid;
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [officeInfo, setOfficeInfo] = useState({
    name: '',
    address: '',
    phone: '',
    lat: '',
    lng: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('availability');

  useEffect(() => {
    const loa
