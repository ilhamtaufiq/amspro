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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Ikon loading
import { router, usePage } from "@inertiajs/react";
import { Pekerjaan, Kegiatan, Kecamatan, Desa, Meta } from "./types";

interface AuthUser {
  permissions: string[];
}

interface PageProps {
  auth: {
    user: AuthUser;
  };
  [key: string]: any;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta: Meta;
  tahun: number;
  search: string;
  kegiatanList: Kegiatan[];
  kecamatanList: Kecamatan[];
  desaList: Desa[];
}

export function DataTable<TData extends Pekerjaan, TValue>({
  columns,
  data: initialData,
  meta,
  tahun,
  search: initialSearch,
  kegiatanList,
  kecamatanList,
  desaList,
}: DataTableProps<TData, TValue>) {
  const { auth } = usePage<PageProps>().props;
  const userPermissions = auth?.user?.permissions || [];
  const [data, setData] = React.useState<TData[]>(initialData);
  const [sorting, setSorting] = React.useState<
    { id: string; desc: boolean }[]
  >([]);
  const [search, setSearch] = React.useState(initialSearch);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);

  // Sync data state with initialData when it changes
  React.useEffect(() => {
    setData(initialData);
    setIsSearching(false); // Reset loading state after data updates
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

  const updateTableData = (newData: Pekerjaan | null, isCreate = false, deleteId?: number) => {
    console.log("updateTableData called with:", { newData, isCreate, deleteId });
    setData((prev) => {
      if (newData === null && deleteId) {
        // Delete: Remove the row
        return prev.filter((item) => item.id !== deleteId);
      }
      if (isCreate && newData) {
        // Create: Append the new row
        return [newData as unknown as TData, ...prev];
      }
      if (!newData) return prev;
      // Update: Replace the existing row
      return prev.map((item) =>
        item.id === newData.id ? { ...item, ...newData } as unknown as TData : item
      );
    });
  };

  const performSearch = (value: string) => {
    setIsSearching(true);
    router.get(
      "/pekerjaan",
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
      "/pekerjaan",
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
    meta: {
      kegiatanList,
      kecamatanList,
      desaList,
      tahun,
      updateTableData,
      searchQuery: search,
      meta,
      createOpen,
      setCreateOpen,
      userPermissions,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              placeholder="Cari nama paket, kecamatan, atau desa..."
              value={search}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              className="max-w-sm pr-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {userPermissions.includes("create pekerjaan") && (
            <Button onClick={() => setCreateOpen(true)}>
              Tambah Pekerjaan
            </Button>
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
