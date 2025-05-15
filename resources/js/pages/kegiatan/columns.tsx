import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

export interface Kegiatan {
    id: number;
    nama: string;
    bidang: string;
    tahun_anggaran: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<Kegiatan, unknown>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "nama",
        header: "Nama Kegiatan",
        cell: ({ row }) => <div>{row.getValue("nama")}</div>,
    },
    {
        accessorKey: "bidang",
        header: "Bidang",
        cell: ({ row }) => <div>{row.getValue("bidang")}</div>,
    },
    {
        accessorKey: "tahun_anggaran",
        header: "Tahun Anggaran",
        cell: ({ row }) => <div>{row.getValue("tahun_anggaran")}</div>,
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
            <div>{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/kegiatan/${row.getValue("id")}/edit`}>Edit</Link>
                </Button>
                <Button variant="destructive" size="sm" asChild>
                    <Link
                        href={`/kegiatan/${row.getValue("id")}`}
                        method="delete"
                        as="button"
                        type="button"
                    >
                        Delete
                    </Link>
                </Button>
            </div>
        ),
    },
]; 