import React, { useEffect, useState } from 'react';
import { auth, db } from '../App';
import { signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

export default function OfficeDashboard() {
  const officeId = auth.currentUser.uid;
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const availRef = collection(db, 'offices', officeId, 'availability');
    return onSnapshot(availRef, (snap) => {
      setSlots(snap.docs.map((d) => ({ time: d.id })));
    });
  }, []);

  const toggleSlot = (time) => {
    const slotRef = doc(db, 'offices', officeId, 'availability', time);
    if (slots.find((s) => s.time === time)) {
      deleteDoc(slotRef);
    } else {
      setDoc(slotRef, { available: true });
    }
  };

  const times = getTodayTimes();

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <button onClick={() => signOut(auth)} className="mb-4 text-red-500">
        Logout
      </button>
      <div className="grid grid-cols-4 gap-2">
        {times.map((time) => (
          <button
            key={time}
            onClick={() => toggleSlot(time)}
            className={`p-2 rounded ${
              slots.find((s) => s.time === time)
                ? 'bg-green-200'
                : 'bg-gray-200'
            }`}
          >
            {new Date(Number(time)).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </button>
        ))}
      </div>
    </div>
  );
}

function getTodayTimes() {
  const arr = [];
  const start = new Date();
  start.setHours(8, 0, 0, 0);
  for (let i = 0; i < 40; i++) {
    arr.push((start.getTime() + i * 15 * 60 * 1000).toString());
  }
  return arr;
}
