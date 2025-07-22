import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentGeoJSONProps {
    geojson: GeoJSON.FeatureCollection[];
}

const MapComponentGeoJSON: React.FC<MapComponentGeoJSONProps> = ({ geojson }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-6.88, 107.13], 10); // Default to Cianjur coordinates

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);
        }

        if (mapInstance.current) {
            // Clear existing GeoJSON layers
            mapInstance.current.eachLayer((layer: any) => {
                if (layer instanceof L.GeoJSON) {
                    mapInstance.current?.removeLayer(layer);
                }
            });

            // Add new GeoJSON layers
            geojson.forEach(geo => {
                const getFeatureStyle = (feature: GeoJSON.Feature) => {
                    if (feature.properties && feature.properties.village_code) {
                        // Style for villages
                        return {
                            color: '#0000FF', // Blue for villages
                            weight: 1,
                            opacity: 1,
                            fillColor: '#ADD8E6', // Light blue fill
                            fillOpacity: 0.5
                        };
                    } else {
                        // Style for districts
                        return {
                            color: '#FF0000', // Red for districts
                            weight: 2,
                            opacity: 1,
                            fillColor: '#FFD700', // Gold fill
                            fillOpacity: 0.2
                        };
                    }
                };

                L.geoJSON(geo, {
                    style: getFeatureStyle,
                    onEachFeature: (feature, layer) => {
                        let popupContent = '';
                        if (feature.properties) {
                            if (feature.properties.village_code) {
                                popupContent += `<b>Desa:</b> ${feature.properties.village || 'N/A'}<br/>`;
                                popupContent += `<b>Kecamatan:</b> ${feature.properties.district || 'N/A'}<br/>`;
                            } else if (feature.properties.district) {
                                popupContent += `<b>Kecamatan:</b> ${feature.properties.district || 'N/A'}<br/>`;
                            } else if (feature.properties.NAME_3) {
                                popupContent += `<b>Nama:</b> ${feature.properties.NAME_3}<br/>`;
                            }
                        }
                        if (popupContent) {
                            layer.bindPopup(popupContent);
                        }
                    }
                }).addTo(mapInstance.current!);
            });

            // Adjust map view to fit GeoJSON bounds
            const bounds = L.latLngBounds([]);
            geojson.forEach(geo => {
                L.geoJSON(geo).eachLayer(layer => {
                    if (layer instanceof L.Path) {
                        bounds.extend(layer.getBounds());
                    }
                });
            });

            if (bounds.isValid()) {
                mapInstance.current.fitBounds(bounds);
            }
        }
    }, [geojson]);

    return <div ref={mapRef} style={{ height: '600px', width: '100%' }} className="rounded-md" />;
};

export default MapComponentGeoJSON;
