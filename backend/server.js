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

      // Fetch availability
      const availSnap = await db
        .collection('offices')
        .doc(doc.id)
        .collection('availability')
        .get();

      // Fetch bookings
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
    // Check if slot exists in availability
    const availRef = db
      .collection('offices')
      .doc(officeId)
      .collection('availability')
      .doc(time);

    const docSnap = await availRef.get();
    if (!docSnap.exists) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    // Check if slot is already booked
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

    // Create booking
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

// Get bookings for an office (for dashboard)
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
