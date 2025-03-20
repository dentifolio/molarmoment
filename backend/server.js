const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const zipcodes = require("zipcodes");
const WebSocket = require("ws");
const { db } = require("./firebaseAdmin"); // Firebase Firestore

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// ✅ **Daily Reset Function**
const resetDailyAppointments = async () => {
  try {
    const snapshot = await db.collection("appointments").get();
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
    console.log("🔄 Daily reset completed. All appointments cleared.");
  } catch (error) {
    console.error("❌ Error clearing appointments:", error);
  }
};

// ✅ **Schedule Daily Reset at Midnight**
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
scheduleDailyReset();

// ✅ **WebSocket - Broadcast Update**
const broadcastUpdate = async () => {
  try {
    const snapshot = await db.collection("appointments").get();
    const appointments = snapshot.docs.map(doc => doc.data());

    const updatedData = JSON.stringify({ type: "update", appointments });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(updatedData);
      }
    });
  } catch (error) {
    console.error("❌ Error broadcasting updates:", error);
  }
};

// ✅ **Book an Appointment**
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

    broadcastUpdate();
    res.json({ success: true, message: "Appointment booked successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error booking appointment", error });
  }
});

// ✅ **Fetch Active Offices**
app.get("/active-offices", async (req, res) => {
  try {
    const snapshot = await db.collection("offices").get();
    const offices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(offices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offices", error });
  }
});

// ✅ **Fetch Appointments for Office**
app.get("/appointments", async (req, res) => {
  try {
    const { officeId } = req.query;
    const snapshot = await db.collection("appointments").where("officeId", "==", officeId).get();

    if (snapshot.empty) {
      return res.json([]); // Return empty array if no appointments
    }

    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching appointments", error });
  }
});

// ✅ **Update Office Information**
app.post("/update-office-info", async (req, res) => {
  const { oldEmail, newEmail, name, address, phone, website, zipCode, state } = req.body;

  try {
    const snapshot = await db.collection("offices").where("email", "==", oldEmail).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Office not found" });
    }

    const officeRef = snapshot.docs[0].ref;

    // Prevent duplicate email registration
    if (newEmail !== oldEmail) {
      const existingEmail = await db.collection("offices").where("email", "==", newEmail).get();
      if (!existingEmail.empty) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    await officeRef.update({ email: newEmail, name, address, phone, website, zipCode, state });
    console.log(`✅ Updated office info for: ${newEmail}`);

    res.json({ success: true, message: "Office updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating office", error });
  }
});

// ✅ **Update Available Slots**
app.post("/update-availability", async (req, res) => {
  const { email, availableSlots } = req.body;

  try {
    const snapshot = await db.collection("offices").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Office not found" });
    }

    const officeRef = snapshot.docs[0].ref;
    await officeRef.update({ availableSlots });

    broadcastUpdate();
    res.json({ success: true, message: "Availability updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error });
  }
});

// ✅ **WebSocket - Live Updates**
wss.on("connection", async (ws) => {
  console.log("🔌 New WebSocket connection established");

  try {
    const snapshot = await db.collection("appointments").get();
    const appointments = snapshot.docs.map(doc => doc.data());

    ws.send(JSON.stringify({ type: "update", appointments }));
  } catch (error) {
    console.error("❌ Error sending updates to client:", error);
  }

  ws.on("close", () => {
    console.log("🔌 WebSocket client disconnected");
  });
});

// ✅ **Logout Route**
app.post("/logout", (req, res) => {
  console.log("🚪 Office logged out");
  res.json({ message: "Logged out successfully" });
});

// ✅ **Start Server**
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
