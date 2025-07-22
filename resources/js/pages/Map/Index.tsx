import React from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head } from '@inertiajs/react';
import MapComponentGeoJSON from '@/components/MapComponentGeoJSON';

interface MapPageProps {
    geojson: GeoJSON.FeatureCollection[];
    auth: {
        user: {
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        };
    };
}

export default function MapIndex({ auth, geojson }: MapPageProps) {
    return (
        <AuthenticatedLayout user={auth.user} header="Peta Interaktif">
            <Head title="Peta Interaktif" />
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">Peta Interaktif Wilayah Kecamatan</h1>
                <div className="h-[600px] w-full rounded-md overflow-hidden">
                    <MapComponentGeoJSON geojson={geojson} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
