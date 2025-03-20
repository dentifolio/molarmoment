import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Sign Up
export const signUp = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Sign In
export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Sign Out
export const logout = async () => {
  return await signOut(auth);
};
