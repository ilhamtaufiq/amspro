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
    kecamatanList: { id: number; name: string; geojson: GeoJSON.Feature | null; pekerjaan_count: number }[];
    desaList: { id: number; name: string; kecamatan_id: number; geojson: GeoJSON.Feature | null; pekerjaan_count: number }[];
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

    // Memoize popup content creation with pekerjaan count
    const createPopupContent = useCallback((feature: GeoJSON.Feature) => {
        if (!feature.properties) return '';
        
        let content = '';
        let pekerjaanCount = 0;
        
        if (feature.properties.village_code) {
            // This is a desa feature
            const desaName = feature.properties.village || '';
            const kecamatanName = feature.properties.district || '';
            
            // Find matching desa in our data
            const matchingDesa = desaList.find(d => 
                d.name.toLowerCase().trim() === desaName.toLowerCase().trim()
            );
            
            pekerjaanCount = matchingDesa?.pekerjaan_count || 0;
            
            content += `<b>Desa:</b> ${desaName}<br/>`;
            content += `<b>Kecamatan:</b> ${kecamatanName}<br/>`;
            content += `<b>Jumlah Pekerjaan:</b> ${pekerjaanCount}<br/>`;
            
        } else if (feature.properties.district) {
            // This is a kecamatan feature
            const kecamatanName = feature.properties.district || '';
            
            // Find matching kecamatan in our data
            const matchingKecamatan = kecamatanList.find(k => 
                k.name.toLowerCase().trim() === kecamatanName.toLowerCase().trim()
            );
            
            pekerjaanCount = matchingKecamatan?.pekerjaan_count || 0;
            
            content += `<b>Kecamatan:</b> ${kecamatanName}<br/>`;
            content += `<b>Jumlah Pekerjaan:</b> ${pekerjaanCount}<br/>`;
            
        } else if (feature.properties.NAME_3) {
            content += `<b>Nama:</b> ${feature.properties.NAME_3}<br/>`;
        }
        
        return content;
    }, [desaList, kecamatanList]);

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
        fitMapToBounds();
    }, [geojson, selectedFeatureGeoJSON, clearLayers, addGeoJsonLayers, fitMapToBounds]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-md" />;
};

export default React.memo(MapComponentGeoJSON);