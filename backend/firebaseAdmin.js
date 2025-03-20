const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://findopendentist.firebaseio.com"
});

const db = admin.firestore();
module.exports = { db };
