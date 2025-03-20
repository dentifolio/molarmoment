import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add Appointment Booking
export const addAppointment = async (appointmentData) => {
  return await addDoc(collection(db, "appointments"), appointmentData);
};

// Get All Appointments
export const getAppointments = async () => {
  const snapshot = await getDocs(collection(db, "appointments"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
