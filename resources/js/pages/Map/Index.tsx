import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head } from '@inertiajs/react';
import MapComponentGeoJSON from '@/components/MapComponentGeoJSON';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MapPageProps {
    geojson: GeoJSON.FeatureCollection[];
    kecamatanList: { id: number; name: string; geojson: GeoJSON.Feature | null; pekerjaan_count: number }[];
    desaList: { id: number; name: string; kecamatan_id: number; geojson: GeoJSON.Feature | null; pekerjaan_count: number }[];
    pekerjaanGeojson: GeoJSON.Feature[];
    tahun_aktif: number;
    isSuperAdmin: boolean;
    auth: {
        user: {
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
    };
}

// Error boundary component
class MapErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Map Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                            Terjadi Kesalahan pada Peta
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Maaf, terjadi kesalahan saat memuat peta interaktif.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function MapIndex({ 
    auth, 
    geojson, 
    kecamatanList, 
    desaList, 
    pekerjaanGeojson, 
    tahun_aktif, 
    isSuperAdmin 
}: MapPageProps) {
    const [selectedKecamatan, setSelectedKecamatan] = useState<{ id: number; name: string; geojson: GeoJSON.Feature | null } | null>(null);
    const [selectedDesa, setSelectedDesa] = useState<{ id: number; name: string; kecamatan_id: number; geojson: GeoJSON.Feature | null } | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Set map as ready after a short delay to ensure DOM is ready
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMapReady(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Memoize filtered desa list to prevent unnecessary recalculations
    const filteredDesaList = useMemo(() => {
        if (selectedKecamatan) {
            return desaList.filter(desa => desa.kecamatan_id === selectedKecamatan.id);
        }
        return desaList;
    }, [selectedKecamatan, desaList]);

    // Memoize selected feature to prevent unnecessary map updates
    const selectedFeatureGeoJSON = useMemo(() => {
        return selectedDesa?.geojson || selectedKecamatan?.geojson || null;
    }, [selectedDesa, selectedKecamatan]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleKecamatanChange = useCallback((value: string) => {
        try {
            if (value === "all") {
                setSelectedKecamatan(null);
            } else {
                const kecamatan = kecamatanList.find(k => k.id.toString() === value);
                setSelectedKecamatan(kecamatan || null);
            }
            setSelectedDesa(null); // Reset desa selection when kecamatan changes
        } catch (error) {
            console.error('Error in handleKecamatanChange:', error);
            setMapError('Terjadi kesalahan saat memilih kecamatan');
        }
    }, [kecamatanList]);

    const handleDesaChange = useCallback((value: string) => {
        try {
            if (value === "all") {
                setSelectedDesa(null);
            } else {
                const desa = desaList.find(d => d.id.toString() === value);
                setSelectedDesa(desa || null);
            }
        } catch (error) {
            console.error('Error in handleDesaChange:', error);
            setMapError('Terjadi kesalahan saat memilih desa');
        }
    }, [desaList]);

    // Handle map errors
    const handleMapError = useCallback((error: string) => {
        console.error('Map error:', error);
        setMapError(error);
    }, []);

    // Validate geojson data
    const validGeojson = useMemo(() => {
        if (!Array.isArray(geojson)) {
            console.warn('Geojson is not an array:', geojson);
            return [];
        }
        return geojson.filter((geo, index) => {
            if (!geo || typeof geo !== 'object' || !geo.type || geo.type !== 'FeatureCollection') {
                console.warn(`Invalid GeoJSON at index ${index}:`, geo);
                return false;
            }
            return true;
        });
    }, [geojson]);

    return (
        <AuthenticatedLayout user={auth.user} header="Peta Interaktif">
            <Head title="Peta Interaktif" />
            <MapErrorBoundary>
                <div className="h-screen flex flex-col">
                    {/* Error Display */}
                    {mapError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>Error:</strong> {mapError}
                            <button
                                onClick={() => setMapError(null)}
                                className="float-right font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Controls Section - Fixed at top */}
                    <div className="flex space-x-4 mb-4">
                        <Select 
                            value={selectedKecamatan?.id.toString() || "all"} 
                            onValueChange={handleKecamatanChange}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih Kecamatan" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="all">Semua Kecamatan</SelectItem>
                                {kecamatanList.map((kecamatan) => (
                                    <SelectItem key={kecamatan.id} value={kecamatan.id.toString()}>
                                        {kecamatan.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select 
                            value={selectedDesa?.id.toString() || "all"} 
                            onValueChange={handleDesaChange} 
                            disabled={!selectedKecamatan}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih Desa" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="all">Semua Desa</SelectItem>
                                {filteredDesaList.map((desa) => (
                                    <SelectItem key={desa.id} value={desa.id.toString()}>
                                        {desa.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Full Screen Map Container */}
                    <div className="flex-1 w-full">
                        {!isMapReady ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Memuat peta...</p>
                                </div>
                            </div>
                        ) : (
                            <MapComponentGeoJSON 
                                geojson={validGeojson} 
                                selectedFeatureGeoJSON={selectedFeatureGeoJSON} 
                                selectedKecamatanId={selectedKecamatan?.id.toString() || ""} 
                                selectedDesaId={selectedDesa?.id.toString() || ""} 
                                kecamatanList={kecamatanList} 
                                desaList={desaList} 
                                pekerjaanList={[]} 
                                showHeatmap={false}
                            />
                        )}
                    </div>
                </div>
            </MapErrorBoundary>
        </AuthenticatedLayout>
    );
}