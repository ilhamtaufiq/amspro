import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
    photos: Array<{
        lat: number | null;
        lng: number | null;
        nama_paket: string;
        keterangan: string;
        pekerjaan_id: number;
    }>;
}

const MapComponent: React.FC<MapComponentProps> = ({ photos }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        // console.log("MapComponent received photos:", photos);
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-6.8106, 107.1439], 13); // Default to Cianjur coordinates

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);
        }

        if (mapInstance.current) {
            // Clear existing markers
            mapInstance.current.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    mapInstance.current?.removeLayer(layer);
                }
            });

            const uniquePekerjaanPhotos = photos.reduce((acc, current) => {
                if (!acc[current.pekerjaan_id]) {
                    acc[current.pekerjaan_id] = current;
                }
                return acc;
            }, {} as Record<number, typeof photos[0]>);

            // console.log("Unique Pekerjaan Photos for markers:", uniquePekerjaanPhotos);

            // Add new markers
            Object.values(uniquePekerjaanPhotos).forEach(photo => {
                if (photo.lat !== null && photo.lng !== null) {
                    // console.log(`Adding marker for ${photo.nama_paket} at [${photo.lat}, ${photo.lng}]`);
                    const marker = L.marker([photo.lat, photo.lng]).addTo(mapInstance.current!);
                    // console.log("Marker added:", marker);
                    const popupContent = `<b>${photo.nama_paket}</b><br>${photo.keterangan}<br><a href="/pekerjaan/${photo.pekerjaan_id}" target="_blank">Lihat Detail Pekerjaan</a>`;
                    marker.bindPopup(popupContent).openPopup();
                } else {
                    // console.log(`Skipping marker for ${photo.nama_paket} due to null coordinates: lat=${photo.lat}, lng=${photo.lng}`);
                }
            });

            // Adjust map view to fit markers
            const validCoords = Object.values(uniquePekerjaanPhotos).filter(p => p.lat !== null && p.lng !== null).map(p => [p.lat!, p.lng!]);
            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords as L.LatLngExpression[]);
                mapInstance.current.fitBounds(bounds);
            }
        }
    }, [photos]);

    return <div ref={mapRef} style={{ height: '400px', width: '100%' }} className="rounded-md" />; // Set a fixed height for the map
};

export default MapComponent;
