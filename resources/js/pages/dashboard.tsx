import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, CreditCard, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardProps {
  stats: {
    totalPekerjaan: number;
    totalKegiatan: number;
    totalPenerima: number;
    realisasiKeuangan: number;
  };
  recentPekerjaan: {
    id: number;
    nama_paket: string;
    pagu: number;
    kecamatan: string;
    desa: string;
    created_at: string;
  }[];
  kontrakStats: {
    totalKontrak: number;
    nilaiKontrak: number;
  };
  fotoData: {
    id: number;
    pekerjaan_id: number;
    nama_paket: string;
    keterangan: string;
    foto_url: string | null;
    lat: number | null;
    lng: number | null;
  }[];
  tahun_aktif: number;
}

export default function Dashboard({ stats, recentPekerjaan, kontrakStats, fotoData, tahun_aktif }: DashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(value);
  };

  return (
    <AuthenticatedLayout header={`Dashboard - Tahun ${tahun_aktif}`}>
      <Head title="Dashboard" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kegiatan</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKegiatan}</div>
            <p className="text-xs text-muted-foreground">Total kegiatan terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Paket Pekerjaan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPekerjaan}</div>
            <p className="text-xs text-muted-foreground">Total paket pekerjaan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realisasi Keuangan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.realisasiKeuangan)}</div>
            <p className="text-xs text-muted-foreground">Total realisasi keuangan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Kontrak</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kontrakStats.nilaiKontrak)}</div>
            <p className="text-xs text-muted-foreground">Total nilai kontrak</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pekerjaan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Paket</TableHead>
                  <TableHead>Pagu</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Desa</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPekerjaan.map((pekerjaan) => (
                  <TableRow key={pekerjaan.id}>
                    <TableCell>{pekerjaan.nama_paket}</TableCell>
                    <TableCell>{formatCurrency(pekerjaan.pagu)}</TableCell>
                    <TableCell>{pekerjaan.kecamatan}</TableCell>
                    <TableCell>{pekerjaan.desa}</TableCell>
                    <TableCell>{pekerjaan.created_at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Galeri Foto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {fotoData
                .filter((foto) => foto.foto_url)
                .map((foto) => (
                  <div key={foto.id} className="space-y-2">
                    <img
                      src={foto.foto_url!}
                      alt={foto.keterangan}
                      className="h-40 w-full object-cover rounded-md"
                    />
                    <p className="text-sm font-medium">{foto.nama_paket}</p>
                    <p className="text-xs text-muted-foreground">{foto.keterangan}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
