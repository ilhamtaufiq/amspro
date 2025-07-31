import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Head } from "@inertiajs/react";
import { Pekerjaan, Kegiatan, Kecamatan, Desa, Meta } from "./types";

interface PageProps {
    auth: {
        user: {
            permissions: string[];
        };
    };
    pekerjaan: Pekerjaan[];
    kegiatanList: Kegiatan[];
    kecamatanList: Kecamatan[];
    desaList: Desa[];
    meta: Meta;
    tahun: number;
    search: string;
    kegiatan_id: string;
    [key: string]: any;
}

interface PekerjaanIndexProps extends PageProps {
    pekerjaan: Pekerjaan[];
    meta: Meta;
    tahun: number;
    search: string;
    kegiatan_id: string;
    kegiatanList: Kegiatan[];
    kecamatanList: Kecamatan[];
    desaList: Desa[];
    auth: {
        user: {
            name: string;
            email: string;
            roles: { id: number; name: string }[];
            permissions: string[];
        };
    };
}

export default function PekerjaanIndex({
    pekerjaan,
    meta,
    tahun,
    search,
    kegiatan_id,
    kegiatanList,
    kecamatanList,
    desaList,
    auth
}: PekerjaanIndexProps) {
    return (
        <AuthenticatedLayout user={auth.user} header="Daftar Pekerjaan">
            <Head title="Pekerjaan" />
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'">
                <h1 className="text-2xl font-bold mb-4">Daftar Pekerjaan</h1>
                <DataTable
                    columns={columns}
                    data={pekerjaan}
                    meta={meta}
                    tahun={tahun}
                    search={search}
                    kegiatan_id={kegiatan_id}
                    kegiatanList={kegiatanList}
                    kecamatanList={kecamatanList}
                    desaList={desaList}
                    auth={auth}
                />
            </div>
        </AuthenticatedLayout>
    );
}
