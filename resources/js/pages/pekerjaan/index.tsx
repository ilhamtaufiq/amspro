import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Head } from "@inertiajs/react";
import { Pekerjaan, Kegiatan, Kecamatan, Desa, Meta } from "./types";

interface PageProps {
  auth: {
    user: {
      permissions: string[];
    };
  };
  pekerjaan: Pekerjaan[];
  kegiatanList: Kegiatan[];
  kecamatanList: Kecamatan[];
  desaList: Desa[];
  meta: Meta;
  tahun: number;
  search: string;
  [key: string]: any;
}

interface PekerjaanIndexProps extends PageProps {
  pekerjaan: Pekerjaan[];
  meta: Meta;
  tahun: number;
  search: string;
  kegiatanList: Kegiatan[];
  kecamatanList: Kecamatan[];
  desaList: Desa[];
  auth: {
    user: {
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  };
}

export default function PekerjaanIndex({
  pekerjaan,
  meta,
  tahun,
  search,
  kegiatanList,
  kecamatanList,
  desaList,
}: PekerjaanIndexProps) {
  return (
    <AuthenticatedLayout header="Dashboard">
        <Head title="Pekerjaan" />
    <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Daftar Pekerjaan</h1>
        <DataTable
            columns={columns}
            data={pekerjaan}
            meta={meta}
            tahun={tahun}
            search={search}
            kegiatanList={kegiatanList}
            kecamatanList={kecamatanList}
            desaList={desaList}
        />
        </div>
    </AuthenticatedLayout>
  );
}
