// Upgraded BookingModal.jsx
import React, { useState } from 'react';
import { apiUrl } from '../firebase';

const hours = Array.from({ length: 20 }, (_, i) => 7 + i); // 7am - 2am

function BookingModal({ office, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    selectedHour: null
  });

  const availableSlots = Object.keys(office.availability || {}).filter(
    key => office.availability[key]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${apiUrl}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, officeId: office.id })
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl mb-4">Book with {office.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Reason for visit"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <div>
            <h3 className="font-semibold mb-1">Choose a time slot:</h3>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {availableSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  className={`p-2 border rounded text-sm ${formData.selectedHour == slot ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  onClick={() => setFormData({ ...formData, selectedHour: slot })}
                >
                  {slot}:00
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.selectedHour}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
