import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Mail, Phone } from "lucide-react";

const API_BASE_URL = "https://findopendentist.onrender.com";

const PublicMapView = () => {
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(5);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // San Francisco
  const [searchedLocation, setSearchedLocation] = useState(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active-offices`);
      const filtered = response.data.filter((office) => office.availableSlots.length > 0);
      setOffices(filtered);
      console.log("Fetched offices:", filtered); // Debugging line
    } catch (error) {
      console.error("❌ Error fetching offices:", error);
    }
  };

  const searchOffices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search-offices`, {
        params: { zipCode, radius },
      });
      const filtered = response.data.filter((office) => office.availableSlots.length > 0);
      setOffices(filtered);
      console.log("Searched offices:", filtered); // Debugging line

      if (filtered.length === 0) {
        alert("No available appointments found.");
      }
    } catch (error) {
      console.error("❌ Error searching offices:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ MAP SECTION - Single instance */}
      <div className="w-full h-[300px] md:h-[450px]">
        <LoadScript
          googleMapsApiKey="AIzaSyDGBHVURcrUdjYNhCDNjFBWawsv612pQU0"
          onError={(error) => console.error("Error loading Google Maps script:", error)}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "300px" }}
            center={center}
            zoom={12}
          >
            {offices.map((office) =>
              office.location ? (
                <Marker
                  key={office.id}
                  position={office.location}
                  onClick={() => setSelectedOffice(office)}
                />
              ) : null
            )}

            {searchedLocation && (
              <Marker
                position={searchedLocation}
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              />
            )}

            {selectedOffice && selectedOffice.location && (
              <InfoWindow
                position={selectedOffice.location}
                onCloseClick={() => setSelectedOffice(null)}
              >
                <div>
                  <h3 className="font-bold">{selectedOffice.name}</h3>
                  <p className="text-sm">{selectedOffice.address}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* ✅ SEARCH + RESULTS SECTION */}
      <div className="px-4 py-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Find Available Appointments</h2>
          <p className="mb-4 text-sm text-gray-600">
            Enter your ZIP code and search radius below to find dentists with open slots.
          </p>

          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            >
              <option value={1}>1 Mile</option>
              <option value={5}>5 Miles</option>
              <option value={10}>10 Miles</option>
            </select>
            <button
              onClick={searchOffices}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
            >
              Search
            </button>
          </div>

          {/* Results */}
          {offices.length > 0 ? (
            offices.map((office) => (
              <div
                key={office.id}
                className="bg-white p-4 mb-4 rounded shadow"
              >
                <h3 className="font-bold text-lg mb-1">{office.name}</h3>
                <p className="text-sm flex items-center mb-1">
                  <MapPin size={16} className="mr-2 text-blue-500" />
                  {office.address}, {office.city}, {office.state}
                </p>
                <p className="text-sm flex items-center mb-1">
                  <Phone size={16} className="mr-2 text-green-500" />
                  {office.phone}
                </p>
                <p className="text-sm flex items-center">
                  <Mail size={16} className="mr-2 text-red-500" />
                  <a href={`mailto:${office.email}`} className="text-blue-600">{office.email}</a>
                </p>

                <div className="mt-2">
                  <p className="font-medium">Available Time Slots:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {office.availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No available appointments to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicMapView;
