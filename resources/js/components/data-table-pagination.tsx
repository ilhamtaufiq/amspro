"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { router } from "@inertiajs/react";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  meta: {
    current_page: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
}

export function DataTablePagination<TData>({
  table,
  meta,
}: DataTablePaginationProps<TData>) {
  const handlePageChange = (url: string | null | undefined) => {
    if (!url) return;
    router.get(url, {}, { preserveScroll: true });
  };

  const previousLink = meta.links.find((link) =>
    link.label.toLowerCase().includes("sebelumnya")
  );

  const nextLink = meta.links.find((link) =>
    link.label.toLowerCase().includes("selanjutnya")
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
      <div className="text-sm text-gray-600">
        Halaman {meta.current_page} dari {meta.last_page}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(previousLink?.url ?? null)}
          disabled={meta.current_page === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Sebelumnya
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(nextLink?.url ?? null)}
          disabled={meta.current_page === meta.last_page}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
