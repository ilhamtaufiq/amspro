import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Pekerjaan, Meta } from "./types";

interface DokumenPekerjaanIndexProps {
    auth: {
        user: {
            permissions: string[];
        };
    };
    pekerjaan: Pekerjaan[];
    meta: Meta;
    search: string;
}

export default function DokumenPekerjaanIndex({
    auth,
    pekerjaan,
    meta,
    search,
}: DokumenPekerjaanIndexProps) {
    return (
        <AuthenticatedLayout user={auth.user} header="Dokumen Pekerjaan">
            <Head title="Dokumen Pekerjaan" />
            <div className="mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">Daftar Dokumen Pekerjaan</h1>
                <DataTable columns={columns} data={pekerjaan} meta={meta} search={search} />
            </div>
        </AuthenticatedLayout>
    );
}
