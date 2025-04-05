const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Use the dentists.json file (renamed from offices.json)
const dentistsDataPath = path.join(__dirname, 'dentists.json');

// Utility function to read dentist data
const readDentistsData = () => {
  const data = fs.readFileSync(dentistsDataPath);
  return JSON.parse(data);
};

// Utility function to write dentist data
const writeDentistsData = (data) => {
  fs.writeFileSync(dentistsDataPath, JSON.stringify(data, null, 2));
};

// GET endpoint: Retrieve all dentists with their availabilities
app.get('/api/dentists', (req, res) => {
  try {
    const dentists = readDentistsData();
    res.json(dentists);
  } catch (err) {
    res.status(500).json({ error: 'Unable to read dentist data.' });
  }
});

// POST endpoint: Book an appointment for a dentist
app.post('/api/appointments', (req, res) => {
  const { dentistId, date, time } = req.body;
  if (!dentistId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const dentists = readDentistsData();
    const dentist = dentists.find(d => d.id === dentistId);

    if (!dentist) {
      return res.status(404).json({ success: false, message: 'Dentist not found.' });
    }

    const availableSlots = dentist.availability[date];
    if (!availableSlots || !availableSlots.includes(time)) {
      return res.status(400).json({ success: false, message: 'Time slot not available.' });
    }

    // Remove the booked time slot
    dentist.availability[date] = availableSlots.filter(slot => slot !== time);

    // Persist the updated data
    writeDentistsData(dentists);

    res.json({ success: true, message: 'Appointment booked successfully.' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Error booking appointment.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
