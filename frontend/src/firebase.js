import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjoQd01g2bFuxNdph5KBmbxAh3jHnKvHA",
  authDomain: "findopendentist.firebaseapp.com",
  projectId: "findopendentist",
  storageBucket: "findopendentist.firebasestorage.app",
  messagingSenderId: "551912159618",
  appId: "1:551912159618:web:658e579784698fafa2379b",
  measurementId: "G-5YZSB81D2J"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();

// Use Vite-style env variable for API URL
export const apiUrl = import.meta.env.VITE_API_URL;