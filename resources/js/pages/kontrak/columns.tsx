import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, FileText } from "lucide-react";
import { Link } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Kontrak {
    id: number;
    id_pekerjaan: number;
    pekerjaan: {
        nama_paket: string;
    };
    penyedia: {
        nama: string;
    } | null;
    kode_rup: string;
    kode_paket: string;
    nomor_penawaran: string;
    tanggal_penawaran: string;
    nilai_kontrak: number;
    tgl_sppbj: string;
    tgl_spk: string;
    tgl_spmk: string;
    tgl_selesai: string;
    sppbj: string;
    spk: string;
    spmk: string;
}

export const columns: ColumnDef<Kontrak>[] = [
    {
        accessorKey: "pekerjaan.nama_paket",
        header: "Nama Paket Pekerjaan",
        cell: ({ row }) => (
            <Link href={route('pekerjaan.show', { id: row.original.id_pekerjaan })} className="text-blue-600 hover:underline">
                {row.original.pekerjaan.nama_paket}
            </Link>
        ),
        enableHiding: false, // Always visible
    },
    {
        accessorKey: "penyedia.nama",
        header: "Penyedia",
        cell: ({ row }) => row.original.penyedia?.nama ?? '-',
        enableHiding: false, // Always visible
    },
    {
        accessorKey: "kode_rup",
        header: "Kode RUP",
        enableHiding: true,
    },
    {
        accessorKey: "kode_paket",
        header: "Kode Paket",
        enableHiding: true,
    },
    {
        accessorKey: "nomor_penawaran",
        header: "Nomor Penawaran",
        enableHiding: true,
    },
    {
        accessorKey: "tanggal_penawaran",
        header: "Tanggal Penawaran",
        cell: ({ row }) => {
            const date = new Date(row.original.tanggal_penawaran);
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        },
        enableHiding: true,
    },
    {
        accessorKey: "nilai_kontrak",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Nilai Kontrak
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("nilai_kontrak"));
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
        enableHiding: false, // Always visible
    },
    {
        accessorKey: "tgl_sppbj",
        header: "Tanggal SPPBJ",
        cell: ({ row }) => {
            const date = new Date(row.original.tgl_sppbj);
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        },
        enableHiding: true,
    },
    {
        accessorKey: "tgl_spk",
        header: "Tanggal SPK",
        cell: ({ row }) => {
            const date = new Date(row.original.tgl_spk);
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        },
        enableHiding: false, // Always visible
    },
    {
        accessorKey: "tgl_spmk",
        header: "Tanggal SPMK",
        cell: ({ row }) => {
            const date = new Date(row.original.tgl_spmk);
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        },
        enableHiding: true,
    },
    {
        accessorKey: "tgl_selesai",
        header: "Tanggal Selesai",
        cell: ({ row }) => {
            const date = new Date(row.original.tgl_selesai);
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        },
        enableHiding: false, // Always visible
    },
    {
        accessorKey: "sppbj",
        header: "SPPBJ",
        enableHiding: true,
    },
    {
        accessorKey: "spk",
        header: "Nomor SPK",
        enableHiding: false,
    },
    {
        accessorKey: "spmk",
        header: "SPMK",
        enableHiding: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const kontrak = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Generate Dokumen</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link 
                                href={route('kontrak.sppbjPdf', kontrak.id)} 
                                className="w-full flex items-center gap-2"
                                target="_blank"
                            >
                                <FileText className="h-4 w-4" />
                                Generate SPPBJ
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link 
                                href={route('kontrak.spkPdf', kontrak.id)} 
                                className="w-full flex items-center gap-2"
                                target="_blank"
                            >
                                <FileText className="h-4 w-4" />
                                Generate SPK
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link 
                                href={route('kontrak.spmkPdf', kontrak.id)} 
                                className="w-full flex items-center gap-2"
                                target="_blank"
                            >
                                <FileText className="h-4 w-4" />
                                Generate SPMK
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
