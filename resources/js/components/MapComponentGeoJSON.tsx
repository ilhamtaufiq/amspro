import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

    console.log('MapComponentGeoJSON rendered with:', {
        geojsonLength: geojson?.length || 0,
        selectedFeatureGeoJSON: !!selectedFeatureGeoJSON,
        selectedKecamatanId,
        selectedDesaId,
        kecamatanListLength: kecamatanList?.length || 0,
        desaListLength: desaList?.length || 0,
        pekerjaanListLength: pekerjaanList?.length || 0,
        showHeatmap
    });

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
        const initializeMap = () => {
            if (mapRef.current && !mapInstance.current) {
                try {
                    // Check if Leaflet is available
                    if (typeof L === 'undefined') {
                        console.error('Leaflet is not loaded');
                        return;
                    }

                    // Check if container has proper dimensions
                    const rect = mapRef.current.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        console.log('Map container has no dimensions, retrying...');
                        setTimeout(initializeMap, 100);
                        return;
                    }

                    console.log('Initializing map...');
                    mapInstance.current = L.map(mapRef.current).setView([-6.88, 107.13], 10);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(mapInstance.current);

                    // Set default icon options here
                    L.Marker.prototype.options.icon = defaultIcon;
                    
                    // Invalidate map size to ensure proper rendering
                    setTimeout(() => {
                        if (mapInstance.current) {
                            mapInstance.current.invalidateSize();
                        }
                    }, 100);
                    
                    console.log('Map initialized successfully');
                } catch (error) {
                    console.error('Error initializing map:', error);
                }
            }
        };

        // Try to initialize immediately
        initializeMap();

        // If not ready, try again after a short delay
        if (!mapRef.current) {
            const timer = setTimeout(initializeMap, 100);
            return () => clearTimeout(timer);
        }

        // Cleanup function
        return () => {
            if (mapInstance.current) {
                try {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                } catch (error) {
                    console.error('Error cleaning up map:', error);
                }
            }
        };
    }, []);

    // Clear existing layers
    const clearLayers = useCallback(() => {
        if (!mapInstance.current) return;

        try {
            // Clear GeoJSON layers
            geoJsonLayersRef.current.forEach(layer => {
                try {
                    mapInstance.current?.removeLayer(layer);
                } catch (error) {
                    console.warn('Error removing layer:', error);
                }
            });
            geoJsonLayersRef.current = [];
        } catch (error) {
            console.error('Error clearing layers:', error);
        }
    }, []);

    // Add GeoJSON layers
    const addGeoJsonLayers = useCallback(() => {
        if (!mapInstance.current) return;

        // Validate geojson data
        if (!Array.isArray(geojson) || geojson.length === 0) {
            console.warn('No valid GeoJSON data provided');
            return;
        }

        geojson.forEach((geo, index) => {
            try {
                // Validate individual GeoJSON object
                if (!geo || typeof geo !== 'object' || !geo.type || geo.type !== 'FeatureCollection') {
                    console.warn(`Invalid GeoJSON structure at index ${index}:`, geo);
                    return;
                }

                const geoJsonLayer = L.geoJSON(geo, {
                    style: getFeatureStyle,
                    onEachFeature: (feature, layer) => {
                        try {
                            const popupContent = createPopupContent(feature);
                            if (popupContent) {
                                layer.bindPopup(popupContent);
                            }
                        } catch (error) {
                            console.warn('Error creating popup content:', error);
                        }
                    }
                });
                
                geoJsonLayer.addTo(mapInstance.current!);
                geoJsonLayersRef.current.push(geoJsonLayer);
            } catch (error) {
                console.error(`Error processing GeoJSON layer ${index}:`, error);
            }
        });
    }, [geojson, getFeatureStyle, createPopupContent]);

    // Fit map to bounds
    const fitMapToBounds = useCallback(() => {
        if (!mapInstance.current) return;

        try {
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
                try {
                    allGeoJsonBounds.extend(layer.getBounds());
                } catch (error) {
                    console.warn('Error extending bounds:', error);
                }
            });

            if (allGeoJsonBounds.isValid()) {
                mapInstance.current.fitBounds(allGeoJsonBounds);
            }
        } catch (error) {
            console.error('Error fitting map to bounds:', error);
        }
    }, [selectedFeatureGeoJSON]);

    // Main effect for updating map layers
    useEffect(() => {
        if (!mapInstance.current) {
            console.log('Map instance not ready, skipping layer update');
            return;
        }

        try {
            clearLayers();
            addGeoJsonLayers();
            fitMapToBounds();
        } catch (error) {
            console.error('Error updating map layers:', error);
        }
    }, [geojson, selectedFeatureGeoJSON, clearLayers, addGeoJsonLayers, fitMapToBounds]);

    // Invalidate map size when component mounts and on window resize
    useEffect(() => {
        const handleResize = () => {
            if (mapInstance.current) {
                try {
                    mapInstance.current.invalidateSize();
                } catch (error) {
                    console.warn('Error invalidating map size on resize:', error);
                }
            }
        };

        if (mapInstance.current) {
            const timer = setTimeout(() => {
                try {
                    mapInstance.current?.invalidateSize();
                } catch (error) {
                    console.warn('Error invalidating map size:', error);
                }
            }, 200);
            
            // Add resize listener
            window.addEventListener('resize', handleResize);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return (
        <div 
            ref={mapRef} 
            style={{ height: '100%', width: '100%' }} 
            className="rounded-md"
        />
    );
};

export default React.memo(MapComponentGeoJSON);