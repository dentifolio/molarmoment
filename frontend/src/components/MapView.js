import React, { useEffect, useRef } from 'react';

function MapView({ offices, onMarkerClick }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    // Load the Google Maps script if not already loaded.
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    // Initialize the map with a center point.
    const initMap = () => {
      // Set a default center (center of the US). If any office has valid coordinates, center near the first one.
      let center = { lat: 39.8283, lng: -98.5795 };
      if (offices && offices.length > 0) {
        const firstWithCoords = offices.find(o => o.lat && o.lng);
        if (firstWithCoords) {
          center = { lat: firstWithCoords.lat, lng: firstWithCoords.lng };
        }
      }

      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 10, // Adjust the zoom level as needed.
      });
      updateMarkers();
    };

    // Update markers on the map.
    const updateMarkers = () => {
      // Remove any existing markers.
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];

      // Loop through the offices and add a marker if:
      // 1. The office has valid latitude and longitude.
      // 2. The office has available appointment slots.
      offices.forEach(office => {
        if (office.lat && office.lng && office.availableSlots && office.availableSlots.length > 0) {
          const marker = new window.google.maps.Marker({
            position: { lat: office.lat, lng: office.lng },
            map: googleMap.current,
            title: office.name,
          });
          marker.addListener('click', () => {
            // Trigger callback when a marker is clicked (e.g., to open booking modal).
            onMarkerClick(office, office.availableSlots[0]);
          });
          markers.current.push(marker);
        }
      });
    };

    loadGoogleMaps();

    // If the offices array changes, update markers on the map.
    if (window.google && googleMap.current) {
      updateMarkers();
    }
  }, [offices, onMarkerClick]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>;
}

export default MapView;