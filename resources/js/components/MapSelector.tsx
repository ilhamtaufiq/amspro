import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';

interface MapSelectorProps {
    onSelectLocation: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onSelectLocation, initialLat, initialLng }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([initialLat || -6.8106, initialLng || 107.1439], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            mapInstance.current.on('click', (e) => {
                const { lat, lng } = e.latlng;
                setSelectedCoords({ lat, lng });

                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current!); // Use default marker
                }
            });
        }

        // Cleanup function
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount

    useEffect(() => {
        // If initial coords are provided, set the marker on mount
        if (mapInstance.current && initialLat && initialLng && !markerRef.current) {
            setSelectedCoords({ lat: initialLat, lng: initialLng });
            markerRef.current = L.marker([initialLat, initialLng]).addTo(mapInstance.current!); // Use default marker
        }
    }, [initialLat, initialLng]);

    const handleSelect = () => {
        if (selectedCoords) {
            onSelectLocation(selectedCoords.lat, selectedCoords.lng);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div ref={mapRef} className="flex-grow" style={{ height: '100%', width: '100%' }} />
            <div className="p-4 flex justify-between items-center border-t">
                <span>
                    {selectedCoords
                        ? `Lat: ${selectedCoords.lat.toFixed(6)}, Lng: ${selectedCoords.lng.toFixed(6)}`
                        : "Klik pada peta untuk memilih lokasi"}
                </span>
                <Button onClick={handleSelect} disabled={!selectedCoords}>
                    Pilih Lokasi Ini
                </Button>
            </div>
        </div>
    );
};

export default MapSelector;
