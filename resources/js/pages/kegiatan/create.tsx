import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import KegiatanForm from "./kegiatan-form";

export default function CreateKegiatan() {
    return (
        <AuthenticatedLayout header="Tambah Kegiatan">
            <Head title="Tambah Kegiatan" />

            <div className="container mx-auto py-10">
                <KegiatanForm />
            </div>
        </AuthenticatedLayout>
    );
} 