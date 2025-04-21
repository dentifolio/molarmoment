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
      const office = { id: doc.id, ...doc.data() };
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
    console.error(e);
    res.status(500).send('Error fetching offices');
  }
});

// Book a slot
app.post('/api/book', async (req, res) => {
  const { officeId, time, patientName } = req.body;
  try {
    const availRef = db
      .collection('offices')
      .doc(officeId)
      .collection('availability')
      .doc(time);
    const docSnap = await availRef.get();
    if (!docSnap.exists) return res.status(400).send('Slot not available');
    await db
      .collection('offices')
      .doc(officeId)
      .collection('bookings')
      .add({
        slot: time,
        patientName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error booking slot');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
