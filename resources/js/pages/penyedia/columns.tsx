import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export type Penyedia = {
    id: number;
    nama: string;
    direktur: string;
    no_akta: string;
    notaris: string;
    tanggal_akta: string;
    alamat: string;
    bank: string;
    norek: string;
};

export const columns = (onDelete: (id: number) => void): ColumnDef<Penyedia>[] => [

    {
        accessorKey: "nama",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nama Perusahaan
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "direktur",
        header: "Direktur",
    },
    {
        accessorKey: "no_akta",
        header: "No. Akta",
    },
    {
        accessorKey: "notaris",
        header: "Notaris",
    },
    {
        accessorKey: "tanggal_akta",
        header: "Tanggal Akta",
    },
    {
        accessorKey: "alamat",
        header: "Alamat",
    },
    {
        accessorKey: "bank",
        header: "Bank",
    },
    {
        accessorKey: "norek",
        header: "No. Rekening",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const penyedia = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(penyedia.nama)}
                        >
                            Copy Nama Perusahaan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href={route('penyedia.edit', penyedia.id)} className="w-full">
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(penyedia.id)}
                            className="text-red-600"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];