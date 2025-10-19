import React, { useEffect, useState } from 'react';

export default function PublicMapView() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = () => {
    setLoading(true);
    fetch('/api/offices')
      .then((res) => res.json())
      .then((data) => {
        setOffices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching offices:', err);
        setLoading(false);
      });
  };

  const handleBookSlot = (office, slot) => {
    setSelectedOffice(office);
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!patientName.trim()) {
      alert('Please enter your name');
      return;
    }

    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officeId: selectedOffice.id,
        time: selectedSlot.time,
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Booking confirmed!');
          setShowBookingModal(false);
          setPatientName('');
          setPatientEmail('');
          setPatientPhone('');
          fetchOffices();
        } else {
          alert(data.error || 'Booking failed');
        }
      })
      .catch((err) => {
        console.error('Error booking:', err);
        alert('Error booking slot');
      });
  };

  const getAvailableSlots = (slots) => {
    return slots.filter(slot => !slot.booked);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading available dentists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Find Open Dentist
          </h1>
          <p className="text-gray-600">
            Book same-day dental appointments near you
          </p>
        </header>

        {offices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No dental offices available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offices.map((office) => {
              const availableSlots = getAvailableSlots(office.slots);

              return (
                <div
                  key={office.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      {office.name}
                    </h2>
                    {office.address && (
                      <p className="text-gray-600 text-sm mb-1">
                        📍 {office.address}
                      </p>
                    )}
                    {office.phone && (
                      <p className="text-gray-600 text-sm">
                        📞 {office.phone}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Available Today ({availableSlots.length} slots)
                    </h3>
                  </div>

                  {availableSlots.length === 0 ? (
                    <p className="text-gray-400 italic">
                      No slots available today
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.slice(0, 9).map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => handleBookSlot(office, slot)}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          {new Date(Number(slot.time)).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </button>
                      ))}
                      {availableSlots.length > 9 && (
                        <div className="col-span-3 text-center text-sm text-gray-500 mt-1">
                          +{availableSlots.length - 9} more slots
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>

              <div className="mb-4">
                <p className="text-gray-600 mb-1">
                  <strong>{selectedOffice?.name}</strong>
                </p>
                <p className="text-gray-600">
                  {new Date(Number(selectedSlot?.time)).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setPatientName('');
                    setPatientEmail('');
                    setPatientPhone('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
