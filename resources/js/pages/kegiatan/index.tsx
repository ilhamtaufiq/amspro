import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { Kegiatan } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomPageProps {
    kegiatan: Kegiatan[];
    [key: string]: any;
}

export default function Kegiatan() {
    const { kegiatan } = usePage<CustomPageProps>().props;
    const [search, setSearch] = useState("");
    const filteredKegiatan = kegiatan.filter(
        (item: Kegiatan) =>
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.bidang.toLowerCase().includes(search.toLowerCase()) ||
            item.tahun_anggaran.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout header="Kegiatan">
            <Head title="Kegiatan" />

            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Manajemen Kegiatan</h1>
                    <Link href="/kegiatan/create">
                        <Button>Tambah Kegiatan</Button>
                    </Link>
                </div>
                <div className="mb-4">
                    <Input
                        placeholder="Cari berdasarkan nama, bidang, atau tahun anggaran..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <DataTable columns={columns} data={filteredKegiatan} />
            </div>
        </AuthenticatedLayout>
    );
} 