import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import KegiatanForm from "./kegiatan-form";

interface EditKegiatanProps {
    kegiatan: {
        id: number;
        nama: string;
        bidang: string;
        tahun_anggaran: string;
    };
}

export default function EditKegiatan({ kegiatan }: EditKegiatanProps) {
    return (
        <AuthenticatedLayout header="Edit Kegiatan">
            <Head title="Edit Kegiatan" />

            <div className="container mx-auto py-10">
                <KegiatanForm kegiatan={kegiatan} />
            </div>
        </AuthenticatedLayout>
    );
} 