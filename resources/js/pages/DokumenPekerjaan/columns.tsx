import { ColumnDef } from "@tanstack/react-table";
import { Pekerjaan, Berkas, Meta } from "./types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Pekerjaan>[] = [
    {
        accessorKey: "nama_paket",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nama Pekerjaan
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const pekerjaan = row.original;
            return (
                <div>
                    <p className="font-medium">{pekerjaan.nama_paket}</p>
                    <p className="text-sm text-muted-foreground">{pekerjaan.kecamatan?.n_kec} - {pekerjaan.desa?.n_desa}</p>
                </div>
            );
        },
    },
    {
        accessorKey: "berkas",
        header: "Dokumen",
        cell: ({ row }) => {
            const pekerjaan = row.original;
            return (
                <div className="space-y-2">
                    {pekerjaan.berkas && pekerjaan.berkas.length > 0 ? (
                        pekerjaan.berkas.map((berkas: Berkas) => (
                            <div key={berkas.id} className="flex items-center gap-2">
                                <a
                                    href={route('berkas.download', [pekerjaan.id, berkas.id])}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {berkas.jenis_dokumen}
                                </a>
                            </div>
                        ))
                    ) : (
                        <span>Tidak ada dokumen</span>
                    )}
                </div>
            );
        },
    },
];
