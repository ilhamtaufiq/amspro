import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    VisibilityState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Loader2, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Meta {
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta: Meta;
    search: string;
    auth: PageProps['auth'];
}

export function DataTable<TData, TValue>({
    columns,
    data: initialData,
    meta,
    search: initialSearch,
    auth,
}: DataTableProps<TData, TValue>) {
    const [data, setData] = useState<TData[]>(initialData);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [search, setSearch] = useState(initialSearch);
    const [isSearching, setIsSearching] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        // Default hidden columns for Penyedia
        no_akta: false,
        notaris: false,
        tanggal_akta: false,
        alamat: false,
        bank: false,
        norek: false,
    });

    useEffect(() => {
        setData(initialData);
        setIsSearching(false);
    }, [initialData]);

    const debounce = <T extends (...args: any[]) => void>(
        func: T,
        delay: number
    ) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const performSearch = (value: string) => {
        setIsSearching(true);
        router.get(
            route("penyedia.index"),
            { search: value, page: 1 },
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
            performSearch(search);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            route("penyedia.index"),
            { search, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnVisibility,
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Input
                            placeholder="Cari nama, direktur, atau no. akta..."
                            value={search}
                            onChange={handleSearch}
                            onKeyDown={handleKeyDown}
                            className="max-w-sm pr-8"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    {auth.user?.permissions?.includes('create penyedia') && (
                        <Link href={route('penyedia.create')}>
                            <Button>Tambah Penyedia</Button>
                        </Link>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Kolom <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border overflow-x-auto">
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
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
