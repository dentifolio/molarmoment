const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const zipcodes = require("zipcodes"); // 📍 ZIP code distance calculations
const WebSocket = require("ws");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

const { db } = require("./firebaseAdmin");
const express = require("express");
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Book an appointment
app.post("/book-slot", async (req, res) => {
  const { officeId, timeSlot, patientName, patientEmail, patientPhone, reason, paymentMethod } = req.body;

  try {
    const appointmentRef = db.collection("appointments").doc();
    await appointmentRef.set({
      officeId,
      timeSlot,
      patientName,
      patientEmail,
      patientPhone,
      reason,
      paymentMethod,
      createdAt: new Date(),
    });

    res.json({ success: true, message: "Appointment booked successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error booking appointment", error });
  }
});

// ✅ **Load Offices from a File**
const loadOffices = () => {
  try {
    const data = fs.readFileSync("offices.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error loading offices.json:", error.message);
    return [];
  }
};

// ✅ **Save Offices to File**
const saveOffices = (offices) => {
  fs.writeFileSync("offices.json", JSON.stringify(offices, null, 2));
};

// Load offices into memory
let offices = loadOffices();

// 🔹 **WebSocket - Broadcast Update**
const broadcastUpdate = () => {
  const updatedData = JSON.stringify({ type: "update", offices });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updatedData);
    }
  });
};
// 🔹 **Daily Reset Function**
const resetDailyAppointments = () => {
  offices.forEach((office) => {
    office.bookedAppointments = []; // Clear all bookings
  });
  saveOffices(offices);
  console.log("🔄 Daily reset completed. All appointments cleared.");
};

// 🔹 **Schedule Reset at Midnight**
const scheduleDailyReset = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // Set to midnight

  const timeUntilMidnight = nextMidnight - now;
  console.log(`⏳ Next reset scheduled in ${timeUntilMidnight / 1000 / 60} minutes`);

  setTimeout(() => {
    resetDailyAppointments();
    setInterval(resetDailyAppointments, 24 * 60 * 60 * 1000); // Reset every 24 hours
  }, timeUntilMidnight);
};

// Start the reset schedule
scheduleDailyReset();

// 📌 **Find Offices by ZIP & Radius**
app.get("/search-offices", (req, res) => {
  const { zipCode, radius } = req.query;
  const userLocation = zipcodes.lookup(zipCode);

  if (!userLocation) {
    return res.status(400).json({ message: "Invalid ZIP code" });
  }

  const nearbyOffices = offices.filter(office => {
    const officeLocation = zipcodes.lookup(office.zipCode);
    if (!officeLocation) return false;
    const distance = zipcodes.distance(zipCode, office.zipCode);
    return distance <= radius;
  });

  res.json(nearbyOffices.map(office => ({
    ...office,
    location: office.location
  })));
});

// 🔹 **LOGIN ROUTE**
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("🔄 Attempting login for:", email);

  const office = offices.find(o => o.email === email && o.password === password);
  if (office) {
    console.log("✅ Login successful for:", office.name);
    return res.json({ success: true, office });
  } else {
    console.log("❌ Invalid credentials");
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 🔹 **SIGNUP ROUTE**
app.post("/signup", (req, res) => {
  const { email, password, name, phone, address, website, zipCode, state } = req.body;

  if (offices.some((o) => o.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const newOffice = {
    id: offices.length + 1,
    email,
    password,
    name,
    phone,
    address,
    website,
    zipCode,
    state,
    availableSlots: [],
    bookedAppointments: [],
  };

  offices.push(newOffice);
  saveOffices(offices);

  console.log("✅ New office registered:", newOffice);
  return res.status(201).json({ office: newOffice });
});

// 🔹 **Fetch Active Offices**
app.get("/active-offices", (req, res) => {
  console.log("📍 Fetching active offices...");
  const activeOffices = offices.map(o => ({
    id: o.id,
    name: o.name,
    email: o.email,
    address: o.address,
    phone: o.phone,
    website: o.website,
    state: o.state,
    zipCode: o.zipCode,
    location: o.location,
    availableSlots: o.availableSlots,
    bookedAppointments: o.bookedAppointments,
  }));
  res.json(activeOffices);
});

// 🔹 **Fetch Appointments for Office**
//app.get("/appointments", (req, res) => {
//  const { officeId } = req.query;
//  const office = offices.find(o => o.id === Number(officeId));

//  if (!office) {
//    return res.status(404).json({ message: "Office not found" });
//  }

//  res.json(office.bookedAppointments || []);
//});

app.get("/appointments", async (req, res) => {
  try {
    const snapshot = await db.collection("appointments").get();
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching appointments", error });
  }
});

// 🔹 **Update Office Information**
app.post("/update-office-info", (req, res) => {
  const { oldEmail, newEmail, name, address, phone, website, zipCode, state } = req.body;
  const office = offices.find(o => o.email === oldEmail);

  if (!office) {
    return res.status(404).json({ message: "Office not found" });
  }

  // Prevent duplicate email registration
  if (newEmail !== oldEmail && offices.some(o => o.email === newEmail)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Update office information
  office.email = newEmail; // ✅ Allow email change
  office.name = name;
  office.address = address;
  office.phone = phone;
  office.website = website;
  office.zipCode = zipCode;
  office.state = state;

  saveOffices(offices);
  console.log(`✅ Updated office info for: ${office.email}`);
  res.json({ success: true, office });
});


// 🔹 **Update Available Slots**
app.post("/update-availability", (req, res) => {
  const { email, availableSlots } = req.body;
  const office = offices.find(o => o.email === email);

  if (!office) {
    return res.status(404).json({ message: "Office not found" });
  }

  office.availableSlots = availableSlots;
  saveOffices(offices);
  broadcastUpdate();

  console.log(`✅ Updated available slots for: ${office.email}`);
  res.json({ success: true, office });
});

// 🔹 **Book Appointment**
app.post("/book-slot", (req, res) => {
  const { officeId, timeSlot, patientName, patientEmail, patientPhone, reason, paymentMethod } = req.body;

  const office = offices.find(o => o.id === Number(officeId));
  if (!office) {
    return res.status(404).json({ success: false, message: "Office not found" });
  }

  if (!office.availableSlots.includes(timeSlot)) {
    return res.status(400).json({ success: false, message: "Time slot no longer available" });
  }

  office.availableSlots = office.availableSlots.filter(slot => slot !== timeSlot);
  if (!office.bookedAppointments) office.bookedAppointments = [];

  const appointment = { timeSlot, patientName, patientEmail, patientPhone, reason, paymentMethod };
  office.bookedAppointments.push(appointment);

  saveOffices(offices);
  broadcastUpdate();

  console.log(`✅ Appointment booked at ${timeSlot} for ${patientName}`);
  res.json({ success: true, message: "Appointment booked successfully!", appointment });
});

// 🔹 **WebSocket - Live Updates**
wss.on("connection", (ws) => {
  console.log("🔌 New WebSocket connection established");

  ws.send(JSON.stringify({ type: "update", offices }));

  ws.on("close", () => {
    console.log("🔌 WebSocket client disconnected");
  });
});

// 🔹 **Logout Route**
app.post("/logout", (req, res) => {
  console.log("🚪 Office logged out");
  res.json({ message: "Logged out successfully" });
});

// 🔥 **Start Server**
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
