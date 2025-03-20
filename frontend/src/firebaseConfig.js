// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjoQd01g2bFuxNdph5KBmbxAh3jHnKvHA",
  authDomain: "findopendentist.firebaseapp.com",
  projectId: "findopendentist",
  storageBucket: "findopendentist.firebasestorage.app",
  messagingSenderId: "551912159618",
  appId: "1:551912159618:web:658e579784698fafa2379b",
  measurementId: "G-5YZSB81D2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
