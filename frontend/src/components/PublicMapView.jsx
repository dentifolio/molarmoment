import React, { useEffect, useState } from 'react';

export default function PublicMapView() {
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    fetch('/api/offices')
      .then((res) => res.json())
      .then((data) => setOffices(data));
  }, []);

  function bookSlot(officeId, time) {
    const patientName = prompt('Enter your name:');
    if (!patientName) return;
    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officeId, time, patientName }),
    }).then((res) => {
      if (res.ok) {
        alert('Booked!');
        setOffices((prev) =>
          prev.map((o) =>
            o.id !== officeId
              ? o
              : {
                  ...o,
                  slots: o.slots.map((s) =>
                    s.time === time ? { ...s, booked: true } : s
                  ),
                }
          )
        );
      }
    });
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Open Dentists</h1>
      {offices.map((office) => (
        <div key={office.id} className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-xl">{office.name}</h2>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {office.slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => !slot.booked && bookSlot(office.id, slot.time)}
                disabled={slot.booked}
                className={`p-2 rounded ${
                  slot.booked ? 'bg-gray-300' : 'bg-green-200'
                }`}
              >
                {new Date(Number(slot.time)).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
