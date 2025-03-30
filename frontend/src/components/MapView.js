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
      const defaultCenter = { lat: 39.8283, lng: -98.5795 };
      const firstWithCoords = offices.find(o => o.lat && o.lng);
      const center = firstWithCoords ? { lat: firstWithCoords.lat, lng: firstWithCoords.lng } : defaultCenter;

      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: firstWithCoords ? 13 : 5,
      });
      updateMarkers();
    };

    const updateMarkers = () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];

      let bounds = new window.google.maps.LatLngBounds();
      let validMarkerCount = 0;

      offices.forEach(office => {
        if (office.lat && office.lng && office.availableSlots && office.availableSlots.length > 0) {
          const position = { lat: office.lat, lng: office.lng };
          const marker = new window.google.maps.Marker({
            position,
            map: googleMap.current,
            title: office.name,
          });

          marker.addListener('click', () => {
            onMarkerClick(office, office.availableSlots[0]);
          });

          markers.current.push(marker);
          bounds.extend(position);
          validMarkerCount++;
        }
      });

      if (validMarkerCount > 0) {
        googleMap.current.fitBounds(bounds);
      }
    };

    loadGoogleMaps();
    if (window.google && googleMap.current) {
      updateMarkers();
    }
  }, [offices, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-64 md:h-96"></div>;
}

export default MapView;
