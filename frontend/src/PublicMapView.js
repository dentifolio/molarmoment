import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import BookingForm from "./BookingForm";

const containerStyle = {
  display: "flex",
  flexDirection: "row",
  height: "100vh",
  width: "100vw",
};

const sidebarStyle = {
  width: "30%",
  maxWidth: "400px",
  minWidth: "300px",
  padding: "20px",
  overflowY: "auto",
  backgroundColor: "#f8f9fa",
  borderRight: "2px solid #ddd",
};

const mapStyle = {
  flex: 1,
  height: "100%",
};

const PublicMapView = () => {
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState(5);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // 📌 Default to San Francisco
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/active-offices");
      const filteredOffices = response.data.filter((office) => office.availableSlots.length > 0);
      setOffices(filteredOffices);
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
  };

  const geocodeZipCode = async (zip) => {
    const apiKey = "AIzaSyDGBHVURcrUdjYNhCDNjFBWawsv612pQU0"; // Replace with your actual API Key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`;

    try {
      const response = await axios.get(geocodeUrl);
      if (response.data.results.length > 0) {
        return response.data.results[0].geometry.location; // Returns { lat, lng }
      }
    } catch (error) {
      console.error("Error fetching ZIP code location:", error);
    }
    return null;
  };

  const searchOffices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/search-offices", {
        params: { zipCode, radius },
      });

      const filteredOffices = response.data.filter((office) => office.availableSlots.length > 0);
      setOffices(filteredOffices);

      const location = await geocodeZipCode(zipCode);
      if (location) {
        setCenter(location);
        setSearchedLocation(location);
      }

      if (filteredOffices.length === 0) {
        alert("No available appointments found in this area.");
      }
    } catch (error) {
      console.error("Error searching offices:", error);
    }
  };

  const openBookingForm = (office, timeSlot) => {
    setSelectedOffice(office);
    setSelectedTimeSlot(timeSlot);
    setShowBookingForm(true);
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <img src="/banner.jpg" alt="Find a Dentist" style={{ width: "100%", marginBottom: "10px", marginTop: "30px" }} />
        <h2>Find Available Appointments</h2>
        <p>Enter your ZIP code and select a search radius to find dentists with open time slots.</p>

        <input
          type="text"
          placeholder="Enter ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <select value={radius} onChange={(e) => setRadius(e.target.value)} style={{ width: "100%", padding: "8px" }}>
          <option value={1}>1 Mile</option>
          <option value={5}>5 Miles</option>
          <option value={10}>10 Miles</option>
        </select>
        <button onClick={searchOffices} style={{ width: "100%", marginTop: "10px", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none" }}>
          Search
        </button>

        <h4>Available Appointments:</h4>
        {offices.length > 0 ? (
          offices.map((office) => (
            <div key={office.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              <strong>{office.name}</strong>
              <p>{office.address}</p>
              <p>{office.city}, {office.state} {office.zipCode}</p>
              <p><strong>Phone:</strong> {office.phone}</p>
              <p><strong>Email:</strong> <a href={`mailto:${office.email}`}>{office.email}</a></p>

              <p><strong>Available Time Slots:</strong></p>
              {office.availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => openBookingForm(office, slot)}
                  style={{
                    margin: "5px",
                    padding: "8px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          ))
        ) : (
          <p>No available appointments found.</p>
        )}
      </div>

      {/* Google Map */}
      <div style={mapStyle}>
        <LoadScript googleMapsApiKey="AIzaSyDGBHVURcrUdjYNhCDNjFBWawsv612pQU0">
          <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={12}>
            {/* Office Markers */}
            {offices.map((office) =>
              office.location ? (
                <Marker key={office.id} position={office.location} onClick={() => setSelectedOffice(office)} />
              ) : null
            )}

            {/* Searched Location Marker */}
            {searchedLocation && (
              <Marker
                position={searchedLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                }}
              />
            )}

            {/* Selected Office Info Window */}
            {selectedOffice && selectedOffice.location && (
              <InfoWindow position={selectedOffice.location} onCloseClick={() => setSelectedOffice(null)}>
                <div>
                  <h3>{selectedOffice.name}</h3>
                  <p>{selectedOffice.address}</p>
                  <p>{selectedOffice.city}, {selectedOffice.state}, {selectedOffice.zipCode}</p>
                  <p><strong>Phone:</strong> {selectedOffice.phone}</p>
                  <p><strong>Email:</strong> <a href={`mailto:${selectedOffice.email}`}>{selectedOffice.email}</a></p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Booking Form */}
      {showBookingForm && <BookingForm office={selectedOffice} timeSlot={selectedTimeSlot} onClose={() => setShowBookingForm(false)} />}
    </div>
  );
};

export default PublicMapView;
