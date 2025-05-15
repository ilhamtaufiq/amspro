import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { Penyedia } from "@/types";

interface DataTableProps {
  columns: { header: string; accessor: keyof Penyedia | "actions" }[];
  data: Penyedia[];
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  const { delete: destroy, processing } = useForm();

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus penyedia ini?")) {
      console.log("Deleting penyedia with id:", id); // Debug log
      destroy(route("penyedia.destroy", id), {
        onSuccess: () => window.location.reload(), // Reload page on success
        onError: (err) => console.error("Error:", err), // Debug errors
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.accessor}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              if (column.accessor === "actions") {
                return (
                  <TableCell key={column.accessor}>
                    <Button href={route("penyedia.edit", row.id)} variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleDelete(row.id)}
                      disabled={processing}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                );
              }
              return (
                <TableCell key={column.accessor}>
                  {column.accessor === "tanggal_akta" && row[column.accessor]
                    ? new Date(row[column.accessor] as string).toLocaleDateString("id-ID")
                    : row[column.accessor] || "-"}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
