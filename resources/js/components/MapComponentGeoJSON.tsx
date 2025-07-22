import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

declare module 'leaflet' {
  interface MarkerOptions {
    _isPekerjaanMarker?: boolean;
  }
}

interface MapComponentGeoJSONProps {
    geojson: GeoJSON.FeatureCollection[];
    selectedFeatureGeoJSON: GeoJSON.Feature | null;
    selectedKecamatanId: string;
    selectedDesaId: string;
    kecamatanList: { id: number; name: string; geojson: GeoJSON.Feature | null }[];
    desaList: { id: number; name: string; kecamatan_id: number; geojson: GeoJSON.Feature | null }[];
    pekerjaanList: { id: number; nama_paket: string; kecamatan_id: number; desa_id: number; kecamatan_name: string | null; desa_name: string | null; lat: number | null; lng: number | null; }[];
}

const MapComponentGeoJSON: React.FC<MapComponentGeoJSONProps> = ({ geojson, selectedFeatureGeoJSON, selectedKecamatanId, selectedDesaId, kecamatanList, desaList, pekerjaanList }) => {
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

            // Clear existing Pekerjaan markers
            mapInstance.current.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    if (layer.options._isPekerjaanMarker) {
                        mapInstance.current?.removeLayer(layer);
                    }
                }
            });

            // Add new GeoJSON layers
            geojson.forEach(geo => {
                const getFeatureStyle = (feature: GeoJSON.Feature | undefined) => {
                    if (!feature || !feature.properties) {
                        return {}; // Return empty style for undefined features
                    }

                    const isFeatureVillage = feature.properties.village_code;
                    const featureKecamatanName = feature.properties.district ? feature.properties.district.toLowerCase().trim() : '';
                    const featureDesaName = feature.properties.village ? feature.properties.village.toLowerCase().trim() : '';

                    // console.log("--- Feature:", feature.properties?.district || feature.properties?.village || feature.properties?.NAME_3);
                    // console.log("selectedKecamatanId:", selectedKecamatanId, "selectedDesaId:", selectedDesaId);

                    let isActive = true;

                    if (selectedDesaId) {
                        // If a specific desa is selected, only that desa is active
                        isActive = isFeatureVillage && featureDesaName === (desaList.find(d => d.id.toString() === selectedDesaId)?.name.toLowerCase().trim() || '');
                        // console.log("Mode Desa Selected. isActive:", isActive);
                    } else if (selectedKecamatanId) {
                        // If a kecamatan is selected, that kecamatan and its desas are active
                        isActive = (feature.properties?.district && featureKecamatanName === (kecamatanList.find(k => k.id.toString() === selectedKecamatanId)?.name.toLowerCase().trim() || '')) ||
                                   (isFeatureVillage && featureKecamatanName === (kecamatanList.find(k => k.id.toString() === selectedKecamatanId)?.name.toLowerCase().trim() || ''));
                    // console.log("Mode Kecamatan Selected. isActive:", isActive);
                    }

                    // console.log("Final isActive:", isActive);

                    if (!isActive) {
                        return {
                            color: '#888888', // Grey border
                            weight: 0.5,
                            opacity: 0.5,
                            fillColor: '#DDDDDD', // Light grey fill
                            fillOpacity: 0.2
                        };
                    }

                    if (isFeatureVillage) {
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

            // Add Pekerjaan markers
            pekerjaanList.forEach(pekerjaan => {
                if (pekerjaan.lat !== null && pekerjaan.lng !== null) {
                    const defaultIcon = L.icon({
                        iconUrl: '/images/marker-icon.png',
                        iconRetinaUrl: '/images/marker-icon-2x.png',
                        shadowUrl: '/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    const marker = L.marker([pekerjaan.lat, pekerjaan.lng], {
                        icon: defaultIcon,
                        _isPekerjaanMarker: true // Custom property for clearing later
                    }).addTo(mapInstance.current!);
                    const popupContent = `<b>${pekerjaan.nama_paket}</b><br/>Kecamatan: ${pekerjaan.kecamatan_name}<br/>Desa: ${pekerjaan.desa_name}<br/><a href="/pekerjaan/${pekerjaan.id}" target="_blank">Lihat Detail</a>`;
                    marker.bindPopup(popupContent);
                }
            });

            // Adjust map view to fit GeoJSON bounds
            const allGeoJsonBounds = L.latLngBounds([]);
            geojson.forEach(geo => {
                const geoJsonLayer = L.geoJSON(geo);
                allGeoJsonBounds.extend(geoJsonLayer.getBounds());
            });

            if (allGeoJsonBounds.isValid()) {
                mapInstance.current.fitBounds(allGeoJsonBounds);
            }
        }

        if (mapInstance.current && selectedFeatureGeoJSON) {
            // console.log("selectedFeatureGeoJSON changed:", selectedFeatureGeoJSON);
            // console.log("Attempting to get bounds from:", selectedFeatureGeoJSON);
            const selectedBounds = L.geoJSON(selectedFeatureGeoJSON).getBounds();
            // console.log("Calculated bounds:", selectedBounds);
            if (selectedBounds.isValid()) {
                mapInstance.current.fitBounds(selectedBounds);
                // console.log("Map fitted to bounds.");
            } else {
                // console.log("Selected feature bounds are not valid.");
            }
        }
    }, [geojson, selectedFeatureGeoJSON]);

    return <div ref={mapRef} style={{ height: '600px', width: '100%' }} className="rounded-md" />;
};

export default MapComponentGeoJSON;