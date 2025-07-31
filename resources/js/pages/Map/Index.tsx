import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head } from '@inertiajs/react';
import MapComponentGeoJSON from '@/components/MapComponentGeoJSON';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MapPageProps {
    geojson: GeoJSON.FeatureCollection[];
    kecamatanList: { id: number; name: string; geojson: GeoJSON.Feature | null }[];
    desaList: { id: number; name: string; kecamatan_id: number; geojson: GeoJSON.Feature | null }[];
    pekerjaanList: { id: number; nama_paket: string; kecamatan_id: number; desa_id: number; kecamatan_name: string | null; desa_name: string | null; lat: number | null; lng: number | null; }[];
    auth: {
        user: {
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
    };
}

export default function MapIndex({ auth, geojson, kecamatanList, desaList, pekerjaanList }: MapPageProps) {
    const [selectedKecamatan, setSelectedKecamatan] = useState<{ id: number; name: string; geojson: GeoJSON.Feature | null } | null>(null);
    const [selectedDesa, setSelectedDesa] = useState<{ id: number; name: string; kecamatan_id: number; geojson: GeoJSON.Feature | null } | null>(null);
    const [filteredDesaList, setFilteredDesaList] = useState(desaList);
    const [showPekerjaan, setShowPekerjaan] = useState(false);

    useEffect(() => {
        if (selectedKecamatan) {
            setFilteredDesaList(desaList.filter(desa => desa.kecamatan_id === selectedKecamatan.id));
        } else {
            setFilteredDesaList(desaList);
        }
        setSelectedDesa(null); // Reset desa selection when kecamatan changes
    }, [selectedKecamatan, desaList]);

    const handleKecamatanChange = (value: string) => {
        const kecamatan = kecamatanList.find(k => k.id.toString() === value);
        setSelectedKecamatan(kecamatan || null);
        // console.log("Selected Kecamatan:", kecamatan);
    };

    const handleDesaChange = (value: string) => {
        const desa = desaList.find(d => d.id.toString() === value);
        setSelectedDesa(desa || null);
        // console.log("Selected Desa:", desa);
    };

    const selectedFeatureGeoJSON = selectedDesa?.geojson || selectedKecamatan?.geojson || null;
    // console.log("Selected Feature GeoJSON:", selectedFeatureGeoJSON);

    return (
        <AuthenticatedLayout user={auth.user} header="Peta Interaktif">
            <Head title="Peta Interaktif" />
            <div className="mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">Peta Interaktif Wilayah Kecamatan</h1>
                <div className="flex space-x-4 mb-4">
                    <Select value={selectedKecamatan?.id.toString() || ""} onValueChange={handleKecamatanChange}>
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

                    <Select value={selectedDesa?.id.toString() || ""} onValueChange={handleDesaChange} disabled={!selectedKecamatan}>
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
                <div className="h-[600px] w-full rounded-md overflow-hidden">
                    <MapComponentGeoJSON geojson={geojson} selectedFeatureGeoJSON={selectedFeatureGeoJSON} selectedKecamatanId={selectedKecamatan?.id.toString() || ""} selectedDesaId={selectedDesa?.id.toString() || ""} kecamatanList={kecamatanList} desaList={desaList} pekerjaanList={showPekerjaan ? pekerjaanList : []} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}