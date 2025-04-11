const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// === AUTH MIDDLEWARE ===
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

// === API ROUTES ===
app.get('/api/offices', async (req, res) => {
  const snapshot = await db.collection('offices')
    .where('availability', '!=', {})
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.put('/api/office/availability', authenticate, async (req, res) => {
  await db.collection('offices').doc(req.user.uid).update({
    availability: req.body
  });
  res.sendStatus(200);
});

app.get('/api/office/profile', authenticate, async (req, res) => {
  const doc = await db.collection('offices').doc(req.user.uid).get();
  if (!doc.exists) {
    await db.collection('offices').doc(req.user.uid).set({ availability: {} });
    return res.json({ availability: {} });
  }
  res.json(doc.data());
});

app.put('/api/office/profile', authenticate, async (req, res) => {
  await db.collection('offices').doc(req.user.uid).set(req.body, { merge: true });
  res.sendStatus(200);
});

app.get('/api/office/bookings', authenticate, async (req, res) => {
  const bookings = await db.collection('bookings')
    .where('officeId', '==', req.user.uid)
    .get();
  res.json(bookings.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post('/api/book', async (req, res) => {
  const { officeId, name, email, reason, selectedHour } = req.body;
  const booking = {
    officeId,
    name,
    email,
    reason,
    selectedHour,
    timestamp: new Date()
  };
  await db.collection('bookings').add(booking);
  res.sendStatus(201);
});

// === DAILY RESET ===
const resetAvailability = async () => {
  const offices = await db.collection('offices').get();
  const batch = db.batch();
  offices.forEach(doc => {
    batch.update(doc.ref, { availability: {} });
  });
  await batch.commit();
};

setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    resetAvailability();
  }
}, 60000);

// === SERVE FRONTEND (Vite built site) ===
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// === START SERVER ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});