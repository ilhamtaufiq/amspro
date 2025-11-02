import { ColumnDef } from "@tanstack/react-table";
import { OutputData } from "@/pages/Output/Dashboard";
import { DataTableColumnHeader } from "@/components/ui/table";

export const columns: ColumnDef<OutputData>[] = [
    {
        accessorKey: "komponen",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Komponen" />
        ),
        cell: ({ row }) => <div>{row.getValue("komponen")}</div>,
    },
    {
        accessorKey: "satuan",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Satuan" />
        ),
        cell: ({ row }) => <div>{row.getValue("satuan")}</div>,
    },
    {
        accessorKey: "total_volume",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total Volume" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total_volume"))
            const formatted = new Intl.NumberFormat("id-ID").format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "jumlah_pekerjaan",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Jumlah Pekerjaan" />
        ),
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("jumlah_pekerjaan")}</div>
        },
    },
];
