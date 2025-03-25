import React, { useEffect, useRef } from 'react';

function MapView({ offices, onMarkerClick }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
        zoom: 4,
      });
      updateMarkers();
    };

    const updateMarkers = () => {
      // Remove any existing markers
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
      // Add markers for each office that has latitude and longitude
      offices.forEach(office => {
        if (office.latitude && office.longitude) {
          const marker = new window.google.maps.Marker({
            position: { lat: office.latitude, lng: office.longitude },
            map: googleMap.current,
            title: office.name,
          });
          marker.addListener('click', () => {
            // For demonstration, select the first available slot when marker is clicked
            if (office.availableSlots && office.availableSlots.length > 0) {
              onMarkerClick(office, office.availableSlots[0]);
            }
          });
          markers.current.push(marker);
        }
      });
    };

    loadGoogleMaps();

    // Update markers when offices data changes
    if (window.google && googleMap.current) {
      updateMarkers();
    }
  }, [offices, onMarkerClick]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
  );
}

export default MapView;
