"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input"; // Tambahkan Input
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Tambahkan Loader2 untuk indikator loading
import { router } from "@inertiajs/react";
import { Status, Meta } from "./types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta: Meta;
  tahun: number;
}

export function DataTable<TData extends Status, TValue>({
  columns,
  data: initialData,
  meta,
  tahun,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = React.useState<TData[]>(initialData);
  const [sorting, setSorting] = React.useState<
    { id: string; desc: boolean }[]
  >([]);
  const [search, setSearch] = React.useState(""); // State untuk input pencarian
  const [isSearching, setIsSearching] = React.useState(false); // State untuk indikator loading

  React.useEffect(() => {
    console.log('Data received in DataTable:', initialData);
    setData(initialData);
    setIsSearching(false); // Reset loading state setelah data diperbarui
  }, [initialData]);

  // Debounce function
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const performSearch = (value: string) => {
    setIsSearching(true);
    router.get(
      "/status",
      { search: value, tahun, page: 1 },
      { preserveState: true, preserveScroll: true }
    );
  };

  const debouncedSearch = debounce((value: string) => {
    performSearch(value);
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch(search); // Langsung cari saat tekan Enter
    }
  };

  const handlePageChange = (page: number) => {
    router.get(
      "/status",
      { search, tahun, page },
      { preserveState: true, preserveScroll: true }
    );
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    manualSorting: false,
  });

  console.log('Table rows:', table.getRowModel().rows);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            placeholder="Cari nama pekerjaan, penyedia..."
            value={search}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="max-w-sm pr-8"
          />
          {isSearching && (
            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {meta.from} sampai {meta.to} dari {meta.total} data
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
          >
            Sebelumnya
          </Button>
          {meta.links.map((link, index) => (
            <Button
              key={index}
              variant={link.active ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (link.url) {
                  const page = new URL(link.url).searchParams.get("page");
                  handlePageChange(Number(page));
                }
              }}
              disabled={!link.url}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
