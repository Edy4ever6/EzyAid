import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Nav } from '../index';


const customMarkerIcon = new L.Icon({
  iconSize: [32, 48],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function Map() {
  const [waypoints, setWaypoints] = useState([]);
  const [selectedLocation] = useState(null);
  const [selectedColor] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch location data
        const response = await axios.get('/locatii'); // Replace with your actual Flask API endpoint
        const locatiiData = response.data;

        // If a location is selected, filter items for that location
        if (selectedLocation) {
          const selectedLocData = locatiiData[selectedLocation];
          const filteredItems = selectedColor
            ? selectedLocData.items.filter((item) => item.culoare === selectedColor)
            : selectedLocData.items;

          const newWaypoints = [
            {
              location: selectedLocation,
              coords: selectedLocData.coords,
              items: filteredItems,
            },
          ];
          setWaypoints(newWaypoints);
        } else {
          // If no location selected, display all locations
          const newWaypoints = Object.keys(locatiiData).map((location) => {
            const coords = locatiiData[location].coords;
            const items = selectedColor
              ? locatiiData[location].items.filter((item) => item.culoare === selectedColor)
              : locatiiData[location].items;

            return { location, coords, items };
          });
          setWaypoints(newWaypoints);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedLocation, selectedColor]);

  useEffect(() => {
    // Create a Leaflet map
    const map = L.map('map').setView([45.9432, 24.9668], 6); // Centered on Romania

    // Add a tile layer (you can use your preferred tile layer provider)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Add markers for each waypoint
    waypoints.forEach((waypoint) => {
      const { location, coords, items } = waypoint;
      if (coords.length === 2) {
        const marker = L.marker(coords, { icon: customMarkerIcon }).addTo(map);
        marker.bindPopup(`<b>${location}</b><br>${items.map(item => `${item.item}: ${item.count} (${item.culoare},${item.size})`).join('<br>')}`);
      }
    });

    return () => {
      // Clean up the map instance when the component unmounts
      map.remove();
    };
  }, [waypoints]);

  return (
    <div id="map" style={{ height: '900px'}}></div>
  );
}

export default Map;