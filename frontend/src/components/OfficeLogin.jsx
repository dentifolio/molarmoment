import React, { useState } from 'react';
import { auth } from '../App';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function OfficeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/dashboard'))
      .catch((e) => alert(e.message));
  };

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/dashboard'))
      .catch((e) => alert(e.message));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Office Login / Signup</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleLogin}
        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Login
      </button>
      <button
        onClick={handleSignup}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Signup
      </button>
    </div>
  );
}
