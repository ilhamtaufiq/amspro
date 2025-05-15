import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import { router } from "@inertiajs/react";
import { Status } from "./types";

export const columns: ColumnDef<Status>[] = [
  {
    accessorKey: "nama_pekerjaan",
    header: "Nama Pekerjaan",
  },
  {
    accessorKey: "mulai_selesai",
    header: "Mulai - Selesai",
    cell: ({ row }) => {
      const mulai = row.original.mulai ?? "N/A";
      const selesai = row.original.selesai ?? "N/A";
      return `${mulai} - ${selesai}`;
    },
  },
  {
    accessorKey: "penyedia",
    header: "Penyedia",
  },
  {
    accessorKey: "pagu",
    header: "Pagu",
    cell: ({ row }) =>
      row.original.pagu
        ? row.original.pagu.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })
        : "N/A",
  },
  {
    accessorKey: "nilai_kontrak",
    header: "Nilai Kontrak",
    cell: ({ row }) =>
      row.original.nilai_kontrak
        ? row.original.nilai_kontrak.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })
        : "N/A",
  },
  {
    accessorKey: "kontrak",
    header: "Kontrak",
    cell: ({ row }) => (
      <Switch
        checked={row.original.kontrak ?? false}
        onCheckedChange={(checked) => {
          router.put(
            route("status.update", row.original.id),
            { kontrak: checked, nphd: row.original.nphd, review: row.original.review },
            {
              preserveState: true,
              preserveScroll: true,
            //   onSuccess: () => console.log("Kontrak updated"),
            //   onError: (err) => console.error("Error updating kontrak:", err),
            }
          );
        }}
      />
    ),
  },
  {
    accessorKey: "nphd",
    header: "NPHD",
    cell: ({ row }) => (
      <Switch
        checked={row.original.nphd ?? false}
        onCheckedChange={(checked) => {
          router.put(
            route("status.update", row.original.id),
            { kontrak: row.original.kontrak, nphd: checked, review: row.original.review },
            {
              preserveState: true,
              preserveScroll: true,
            //   onSuccess: () => console.log("NPHD updated"),
            //   onError: (err) => console.error("Error updating nphd:", err),
            }
          );
        }}
      />
    ),
  },
  {
    accessorKey: "review",
    header: "Review",
    cell: ({ row }) => (
      <Switch
        checked={row.original.review ?? false}
        onCheckedChange={(checked) => {
          router.put(
            route("status.update", row.original.id),
            { kontrak: row.original.kontrak, nphd: row.original.nphd, review: checked },
            {
              preserveState: true,
              preserveScroll: true,
            //   onSuccess: () => console.log("Review updated"),
            //   onError: (err) => console.error("Error updating review:", err),
            }
          );
        }}
      />
    ),
  },
];
