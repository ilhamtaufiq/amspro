import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from './data-table';
import { columns, Kontrak } from './columns';
import { Kegiatan } from "../pekerjaan/types";
import AuthenticatedLayout from "@/layouts/authenticated-layout";


interface KontrakIndexProps extends PageProps {
    kontrak: Kontrak[];
    meta: {
        current_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    search: string;
    tahun: number;
    kegiatanList: Kegiatan[];
    kegiatan_id: string;
}

export default function KontrakIndex({ auth, kontrak, meta, search, tahun, kegiatanList, kegiatan_id }: KontrakIndexProps) {
    return (
        <AuthenticatedLayout user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="">Daftar Kontrak</h2>
                    <div className="flex items-center space-x-4">

                    </div>
                </div>
            }
        >
            <Head title="Daftar Kontrak" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="container mx-auto py-10">

                        <DataTable columns={columns} data={kontrak} meta={meta} search={search} tahun={tahun} kegiatanList={kegiatanList} kegiatan_id={kegiatan_id} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
