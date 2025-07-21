import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import type { PageProps } from '@/types';
import KegiatanForm from "./kegiatan-form";

export default function CreateKegiatan() {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    return (
        <AuthenticatedLayout user={user} header="Tambah Kegiatan">
            <Head title="Tambah Kegiatan" />

            <div className="container mx-auto py-10">
                <KegiatanForm />
            </div>
        </AuthenticatedLayout>
    );
} 