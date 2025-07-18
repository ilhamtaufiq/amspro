import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapDialogContentProps {
  data: any; // Use a more specific type if available
  setData: (key: string, value: any) => void;
  setIsMapOpen: (isOpen: boolean) => void;
}

const MapDialogContent: React.FC<MapDialogContentProps> = ({ data, setData, setIsMapOpen }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([-6.8106, 107.1439], 13); // Default to Cianjur coordinates

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);

      // Set default icon options here
      L.Marker.prototype.options.icon = defaultIcon;

      leafletMapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setData("koordinat", `${lat}, ${lng}`);
      });
    }

    // Update marker position if koordinat changes
    if (leafletMapRef.current && data.koordinat) {
      const [lat, lng] = data.koordinat.split(',').map(parseFloat);
      const newLatLng = L.latLng(lat, lng);

      // Remove existing marker if it exists
      if (markerRef.current) {
        leafletMapRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      markerRef.current = L.marker(newLatLng).addTo(leafletMapRef.current);
      leafletMapRef.current.setView(newLatLng, leafletMapRef.current.getZoom());
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [data.koordinat, setData, setIsMapOpen]);

  return (
    <div className="w-full h-96 rounded-md overflow-hidden mt-2">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapDialogContent;
