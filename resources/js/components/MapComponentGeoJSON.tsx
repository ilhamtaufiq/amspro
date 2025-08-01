import React, { useEffect, useRef, useMemo, useCallback } from 'react';
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
    pekerjaanList: GeoJSON.Feature[];
    showHeatmap: boolean;
}

const MapComponentGeoJSON: React.FC<MapComponentGeoJSONProps> = ({ 
    geojson, 
    selectedFeatureGeoJSON, 
    selectedKecamatanId, 
    selectedDesaId, 
    kecamatanList, 
    desaList, 
    pekerjaanList,
    showHeatmap
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const geoJsonLayersRef = useRef<L.GeoJSON[]>([]);
    const markerLayersRef = useRef<L.Marker[]>([]);
    const circleLayersRef = useRef<L.CircleMarker[]>([]);
    const heatmapLayerRef = useRef<any>(null);

    // Memoize style function to prevent unnecessary recalculations
    const getFeatureStyle = useCallback((feature: GeoJSON.Feature | undefined) => {
        if (!feature || !feature.properties) {
            return {};
        }

        const isFeatureVillage = feature.properties.village_code;
        const featureKecamatanName = feature.properties.district ? feature.properties.district.toLowerCase().trim() : '';
        const featureDesaName = feature.properties.village ? feature.properties.village.toLowerCase().trim() : '';

        let isActive = true;

        if (selectedDesaId) {
            const selectedDesa = desaList.find(d => d.id.toString() === selectedDesaId);
            isActive = isFeatureVillage && featureDesaName === (selectedDesa?.name.toLowerCase().trim() || '');
        } else if (selectedKecamatanId) {
            const selectedKecamatan = kecamatanList.find(k => k.id.toString() === selectedKecamatanId);
            isActive = (feature.properties?.district && featureKecamatanName === (selectedKecamatan?.name.toLowerCase().trim() || '')) ||
                       (isFeatureVillage && featureKecamatanName === (selectedKecamatan?.name.toLowerCase().trim() || ''));
        }

        if (!isActive) {
            return {
                color: '#888888',
                weight: 0.5,
                opacity: 0.5,
                fillColor: '#DDDDDD',
                fillOpacity: 0.2
            };
        }

        if (isFeatureVillage) {
            return {
                color: '#0000FF',
                weight: 1,
                opacity: 1,
                fillColor: '#ADD8E6',
                fillOpacity: 0.5
            };
        } else {
            return {
                color: '#FF0000',
                weight: 2,
                opacity: 1,
                fillColor: '#FFD700',
                fillOpacity: 0.2
            };
        }
    }, [selectedDesaId, selectedKecamatanId, desaList, kecamatanList]);

    // Memoize popup content creation
    const createPopupContent = useCallback((feature: GeoJSON.Feature) => {
        if (!feature.properties) return '';
        
        let content = '';
        if (feature.properties.village_code) {
            content += `<b>Desa:</b> ${feature.properties.village || 'N/A'}<br/>`;
            content += `<b>Kecamatan:</b> ${feature.properties.district || 'N/A'}<br/>`;
        } else if (feature.properties.district) {
            content += `<b>Kecamatan:</b> ${feature.properties.district || 'N/A'}<br/>`;
        } else if (feature.properties.NAME_3) {
            content += `<b>Nama:</b> ${feature.properties.NAME_3}<br/>`;
        }
        return content;
    }, []);

    // Initialize map
    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-6.88, 107.13], 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);
        }
    }, []);

    // Clear existing layers
    const clearLayers = useCallback(() => {
        if (!mapInstance.current) return;

        // Clear GeoJSON layers
        geoJsonLayersRef.current.forEach(layer => {
            mapInstance.current?.removeLayer(layer);
        });
        geoJsonLayersRef.current = [];

        // Clear marker layers
        markerLayersRef.current.forEach(marker => {
            mapInstance.current?.removeLayer(marker);
        });
        markerLayersRef.current = [];

        // Clear circle layers
        circleLayersRef.current.forEach(circle => {
            mapInstance.current?.removeLayer(circle);
        });
        circleLayersRef.current = [];

        // Clear heatmap layer
        if (heatmapLayerRef.current) {
            mapInstance.current?.removeLayer(heatmapLayerRef.current);
            heatmapLayerRef.current = null;
        }
    }, []);

    // Add GeoJSON layers
    const addGeoJsonLayers = useCallback(() => {
        if (!mapInstance.current) return;

        geojson.forEach(geo => {
            const geoJsonLayer = L.geoJSON(geo, {
                style: getFeatureStyle,
                onEachFeature: (feature, layer) => {
                    const popupContent = createPopupContent(feature);
                    if (popupContent) {
                        layer.bindPopup(popupContent);
                    }
                }
            });
            
            geoJsonLayer.addTo(mapInstance.current!);
            geoJsonLayersRef.current.push(geoJsonLayer);
        });
    }, [geojson, getFeatureStyle, createPopupContent]);

    // Add heatmap for pekerjaan
    const addHeatmap = useCallback(() => {
        if (!mapInstance.current || !showHeatmap || pekerjaanList.length === 0) return;

        // Create heatmap data points
        const heatmapData = pekerjaanList
            .filter(pekerjaan => {
                if (pekerjaan.geometry?.type !== 'Point') return false;
                const pointGeometry = pekerjaan.geometry as GeoJSON.Point;
                return pointGeometry.coordinates && pointGeometry.coordinates.length === 2;
            })
            .map(pekerjaan => {
                const pointGeometry = pekerjaan.geometry as GeoJSON.Point;
                const [lng, lat] = pointGeometry.coordinates;
                return {
                    lat: lat,
                    lng: lng,
                    value: 1, // Each pekerjaan has equal weight
                    pekerjaan: pekerjaan
                };
            });

        if (heatmapData.length > 0) {
            // Create a simple heatmap using circle markers with gradient colors
            const maxCount = Math.max(...heatmapData.map(d => d.value));
            
            heatmapData.forEach(point => {
                const intensity = point.value / maxCount;
                const radius = 20 + (intensity * 30); // Radius based on intensity
                const opacity = 0.3 + (intensity * 0.4); // Opacity based on intensity
                
                // Color gradient from blue (low) to red (high)
                const hue = 240 - (intensity * 240); // 240 (blue) to 0 (red)
                const color = `hsl(${hue}, 70%, 50%)`;
                
                const circle = L.circleMarker([point.lat, point.lng], {
                    radius: radius,
                    fillColor: color,
                    color: color,
                    weight: 1,
                    opacity: opacity,
                    fillOpacity: opacity
                }).addTo(mapInstance.current!);

                // Add popup with pekerjaan info
                const popupContent = `
                    <b>${point.pekerjaan.properties?.nama_paket || 'N/A'}</b><br/>
                    Kecamatan: ${point.pekerjaan.properties?.kecamatan || 'N/A'}<br/>
                    Desa: ${point.pekerjaan.properties?.desa || 'N/A'}<br/>
                    <a href="/pekerjaan/${point.pekerjaan.properties?.id}" target="_blank">Lihat Detail</a>
                `;
                circle.bindPopup(popupContent);

                circleLayersRef.current.push(circle);
            });
        }
    }, [pekerjaanList, showHeatmap]);

    // Fit map to bounds
    const fitMapToBounds = useCallback(() => {
        if (!mapInstance.current) return;

        if (selectedFeatureGeoJSON) {
            const selectedBounds = L.geoJSON(selectedFeatureGeoJSON).getBounds();
            if (selectedBounds.isValid()) {
                mapInstance.current.fitBounds(selectedBounds);
                return;
            }
        }

        // Fit to all GeoJSON bounds
        const allGeoJsonBounds = L.latLngBounds([]);
        geoJsonLayersRef.current.forEach(layer => {
            allGeoJsonBounds.extend(layer.getBounds());
        });

        if (allGeoJsonBounds.isValid()) {
            mapInstance.current.fitBounds(allGeoJsonBounds);
        }
    }, [selectedFeatureGeoJSON]);

    // Main effect for updating map layers
    useEffect(() => {
        if (!mapInstance.current) return;

        clearLayers();
        addGeoJsonLayers();
        addHeatmap();
        fitMapToBounds();
    }, [geojson, selectedFeatureGeoJSON, pekerjaanList, showHeatmap, clearLayers, addGeoJsonLayers, addHeatmap, fitMapToBounds]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-md" />;
};

export default React.memo(MapComponentGeoJSON);