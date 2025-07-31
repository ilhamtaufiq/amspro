import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { Kegiatan } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PageProps } from '@/types';

interface CustomPageProps {
    kegiatan: Kegiatan[];
    [key: string]: any;
}

export default function Kegiatan() {
    const { kegiatan, auth } = usePage<any>().props;
    const user = auth.user;
    const [search, setSearch] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [kegiatanToDeleteId, setKegiatanToDeleteId] = useState<number | null>(null);

    const handleDeleteKegiatan = (id: number) => {
        setKegiatanToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (kegiatanToDeleteId !== null) {
            router.delete(route("kegiatan.destroy", kegiatanToDeleteId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setKegiatanToDeleteId(null);
                },
                onError: (err) => {
                    console.error("Error deleting kegiatan:", err);
                    alert("Gagal menghapus kegiatan: " + JSON.stringify(err));
                    setIsDeleteDialogOpen(false);
                    setKegiatanToDeleteId(null);
                },
            });
        }
    };

    const filteredKegiatan = kegiatan.filter(
        (item: Kegiatan) =>
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.bidang.toLowerCase().includes(search.toLowerCase()) ||
            item.tahun_anggaran.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout user={user} header="Kegiatan">
            <Head title="Kegiatan" />

            <div className="mx-auto py-10">
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
                <DataTable columns={columns(handleDeleteKegiatan)} data={filteredKegiatan} />
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} variant="destructive">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
} 