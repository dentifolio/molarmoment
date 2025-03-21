import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import BookingForm from "./BookingForm";
import { MapPin, Mail, Phone } from "lucide-react"; // ✅ Import Lucide Icons

const API_BASE_URL = "https://findopendentist.onrender.com"; // ✅ Ensure this is correct

const PublicMapView = () => {
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(5);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // 📌 Default: San Francisco
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active-offices`);
      const filteredOffices = response.data.filter((office) => office.availableSlots.length > 0);
      setOffices(filteredOffices);
    } catch (error) {
      console.error("❌ Error fetching offices:", error);
    }
  };

  const searchOffices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search-offices`, {
        params: { zipCode, radius },
      });

      const filteredOffices = response.data.filter((office) => office.availableSlots.length > 0);
      setOffices(filteredOffices);

      if (filteredOffices.length === 0) {
        alert("No available appointments found in this area.");
      }
    } catch (error) {
      console.error("❌ Error searching offices:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ Navigation Bar (Logo + Login + Sign Up) */}
      <div className="w-full md:w-2/3 h-[60vh] md:h-full">
        <LoadScript googleMapsApiKey="AIzaSyAdd8rcTdQ2EOMB-4qUwthsqXSVEwSEW1I">
          <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={12}>
            {offices.map((office) =>
              office.location ? (
                <Marker key={office.id} position={office.location} onClick={() => setSelectedOffice(office)} />
              ) : null
            )}

            {searchedLocation && (
              <Marker
                position={searchedLocation}
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              />
            )}

            {selectedOffice && selectedOffice.location && (
              <InfoWindow position={selectedOffice.location} onCloseClick={() => setSelectedOffice(null)}>
                <div>
                  <h3 className="text-md font-semibold">{selectedOffice.name}</h3>
                  <p className="text-sm">{selectedOffice.address}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* ✅ Main Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* ✅ Sidebar Section */}
        <div className="w-full md:w-1/3 p-4 bg-gray-100 shadow-lg overflow-y-auto">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Find Available Appointments</h2>
          <p className="text-gray-600 mb-3">Enter your ZIP code and select a search radius to find available dentists.</p>

          <input
            type="text"
            placeholder="Enter ZIP Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value={1}>1 Mile</option>
            <option value={5}>5 Miles</option>
            <option value={10}>10 Miles</option>
          </select>
          <button
            onClick={searchOffices}
            className="w-full mt-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Search
          </button>

          {/* ✅ Available Appointments List */}
          <h3 className="text-lg font-medium mt-4">Available Appointments:</h3>
          {offices.length > 0 ? (
            offices.map((office) => (
              <div key={office.id} className="p-4 border-b bg-white shadow-md rounded-lg my-2">
                <h4 className="text-md font-semibold text-gray-900">{office.name}</h4>
                <p className="text-sm flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2 text-blue-500" />
                  {office.address}, {office.city}, {office.state}
                </p>
                <p className="text-sm flex items-center text-gray-600">
                  <Phone size={16} className="mr-2 text-green-500" />
                  {office.phone}
                </p>
                <p className="text-sm flex items-center text-gray-600">
                  <Mail size={16} className="mr-2 text-red-500" />
                  <a href={`mailto:${office.email}`} className="text-blue-600">{office.email}</a>
                </p>

                {/* ✅ Time Slots */}
                <div className="mt-2">
                  <h5 className="text-gray-700 font-semibold">Available Time Slots:</h5>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {office.availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        className="px-4 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm mt-2">No available appointments found.</p>
          )}
        </div>

        {/* ✅ Google Map Section (Fixed issue with missing map) */}
        <div className="w-full md:w-2/3 h-[60vh] md:h-full">
          <LoadScript googleMapsApiKey="AIzaSyAdd8rcTdQ2EOMB-4qUwthsqXSVEwSEW1I">
            <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={12}>
              {offices.map((office) =>
                office.location ? (
                  <Marker key={office.id} position={office.location} onClick={() => setSelectedOffice(office)} />
                ) : null
              )}

              {searchedLocation && (
                <Marker
                  position={searchedLocation}
                  icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                />
              )}

              {selectedOffice && selectedOffice.location && (
                <InfoWindow position={selectedOffice.location} onCloseClick={() => setSelectedOffice(null)}>
                  <div>
                    <h3 className="text-md font-semibold">{selectedOffice.name}</h3>
                    <p className="text-sm">{selectedOffice.address}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default PublicMapView;
