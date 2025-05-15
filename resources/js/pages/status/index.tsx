import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Head, usePage } from "@inertiajs/react";
import { Status, Meta } from "./types";

interface StatusPageProps {
  statuses: { data: Status[]; current_page: number; last_page: number; total: number; from: number; to: number; per_page: number; links: Array<{ url: string | null; label: string; active: boolean }> };
  meta: Meta;
  tahun: number;
  search?: string; // Tambahkan search sebagai prop
}

export default function StatusPage({ statuses, meta, tahun, search = "" }: StatusPageProps) {
//   console.log('Statuses received in StatusPage:', statuses);

  return (
    <AuthenticatedLayout header="Checklist">
      <Head title="Checklist" />

      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Checklist</h1>
        <DataTable
          columns={columns}
          data={statuses.data}
          meta={meta}
          tahun={tahun}
          search={search} // Kirimkan search ke DataTable
        />
      </div>
    </AuthenticatedLayout>
  );
}
