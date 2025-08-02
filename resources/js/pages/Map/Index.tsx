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
        if (value === "all") {
            setSelectedKecamatan(null);
        } else {
            const kecamatan = kecamatanList.find(k => k.id.toString() === value);
            setSelectedKecamatan(kecamatan || null);
        }
        setSelectedDesa(null); // Reset desa selection when kecamatan changes
    }, [kecamatanList]);

    const handleDesaChange = useCallback((value: string) => {
        if (value === "all") {
            setSelectedDesa(null);
        } else {
            const desa = desaList.find(d => d.id.toString() === value);
            setSelectedDesa(desa || null);
        }
    }, [desaList]);

    return (
        <AuthenticatedLayout user={auth.user} header="Peta Interaktif">
            <Head title="Peta Interaktif" />
            <div className="h-screen flex flex-col">
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
                    <MapComponentGeoJSON 
                        geojson={geojson} 
                        selectedFeatureGeoJSON={selectedFeatureGeoJSON} 
                        selectedKecamatanId={selectedKecamatan?.id.toString() || ""} 
                        selectedDesaId={selectedDesa?.id.toString() || ""} 
                        kecamatanList={kecamatanList} 
                        desaList={desaList} 
                        pekerjaanList={[]} 
                        showHeatmap={false}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}