import React, { useEffect, useRef } from 'react';

function MapView({ offices, onMarkerClick }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
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

    const initMap = () => {
      let center = { lat: 39.8283, lng: -98.5795 };
      if (offices && offices.length > 0) {
        const firstWithCoords = offices.find(o => o.lat && o.lng);
        if (firstWithCoords) {
          center = { lat: firstWithCoords.lat, lng: firstWithCoords.lng };
        }
      }
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 10,
      });
      updateMarkers();
    };

    const updateMarkers = () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
      offices.forEach(office => {
        if (office.lat && office.lng && office.availableSlots && office.availableSlots.length > 0) {
          const marker = new window.google.maps.Marker({
            position: { lat: office.lat, lng: office.lng },
            map: googleMap.current,
            title: office.name,
          });
          marker.addListener('click', () => {
            onMarkerClick(office, office.availableSlots[0]);
          });
          markers.current.push(marker);
        }
      });
    };

    loadGoogleMaps();
    if (window.google && googleMap.current) {
      updateMarkers();
    }
  }, [offices, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-64 md:h-96"></div>;
}

export default MapView;