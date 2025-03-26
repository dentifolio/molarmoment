const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');

// Initialize Firebase Admin with your service account credentials.
// Ensure you have your serviceAccountKey.json file in this folder.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Socket.io connection – used to broadcast availability changes and appointment bookings
io.on('connection', (socket) => {
  console.log('Client connected: ' + socket.id);
});

// --- API Endpoints ---

// POST /signup – Office registration
app.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone, address, website, zipCode, lat, lng } = req.body;
    const newOffice = { 
      email, 
      password, 
      name, 
      phone, 
      address, 
      website, 
      zipCode, 
      lat: lat || null, 
      lng: lng || null,
      availableSlots: [] 
    };
    const docRef = await db.collection('offices').add(newOffice);
    res.status(201).json({ id: docRef.id, ...newOffice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /login – Login validation
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const snapshot = await db.collection('offices')
      .where('email', '==', email)
      .where('password', '==', password)
      .get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    let office;
    snapshot.forEach(doc => {
      office = { id: doc.id, ...doc.data() };
    });
    res.status(200).json(office);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /active-offices – List all offices with available slots (non‑empty)
app.get('/active-offices', async (req, res) => {
  try {
    const snapshot = await db.collection('offices').where('availableSlots', '!=', []).get();
    let offices = [];
    snapshot.forEach(doc => {
      offices.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(offices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /search-offices?zipCode=XXXXX&radius=X – Filtered search (simplified by zipCode)
app.get('/search-offices', async (req, res) => {
  try {
    const { zipCode, radius } = req.query;
    const snapshot = await db.collection('offices').where('zipCode', '==', zipCode).get();
    let offices = [];
    snapshot.forEach(doc => {
      offices.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(offices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /book-slot – Patient booking
app.post('/book-slot', async (req, res) => {
  try {
    const { officeId, slot, patientName, contact, reason } = req.body;
    // Create a new appointment record
    const newAppointment = { officeId, slot, patientName, contact, reason, bookedAt: new Date() };
    await db.collection('appointments').add(newAppointment);
    // Remove the booked slot from the office's availableSlots
    const officeRef = db.collection('offices').doc(officeId);
    const officeDoc = await officeRef.get();
    if (officeDoc.exists) {
      const data = officeDoc.data();
      const updatedSlots = data.availableSlots.filter(s => s !== slot);
      await officeRef.update({ availableSlots: updatedSlots });
      // Broadcast the updated availability to all clients
      io.emit('availabilityUpdated', { officeId, availableSlots: updatedSlots });
      // Notify the office about the booking
      io.emit('appointmentBooked', { officeId, slot, patientName });
      res.status(200).json({ message: 'Appointment booked' });
    } else {
      res.status(404).json({ error: 'Office not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /update-availability – Office updates their slots
app.post('/update-availability', async (req, res) => {
  try {
    const { officeId, availableSlots } = req.body;
    const officeRef = db.collection('offices').doc(officeId);
    await officeRef.update({ availableSlots });
    io.emit('availabilityUpdated', { officeId, availableSlots });
    res.status(200).json({ message: 'Availability updated', availableSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Daily Reset Job ---
// Clear all availableSlots at midnight to prevent stale availability.
cron.schedule('0 0 * * *', async () => {
  console.log('Resetting appointment slots...');
  try {
    const snapshot = await db.collection('offices').get();
    snapshot.forEach(async (doc) => {
      await doc.ref.update({ availableSlots: [] });
    });
    io.emit('availabilityUpdated', { message: 'Daily reset completed' });
  } catch (error) {
    console.error('Error resetting slots:', error);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});