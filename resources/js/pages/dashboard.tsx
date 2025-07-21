import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Package, Activity } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MapComponent from '@/components/MapComponent';

interface DashboardProps extends PageProps {
    stats?: {
        totalPekerjaan: number;
        totalKegiatan: number;
        totalPenerima: number;
        realisasiKeuangan: number;
    };
    recentPekerjaan?: Array<{
        id: number;
        nama_paket: string;
        pagu: number;
        kecamatan: string;
        desa: string;
        created_at: string;
    }>;
    progressData?: Array<{
        nama_paket: string;
        realisasi_fisik: number;
        realisasi_keuangan: number;
    }>;
    kontrakStats?: {
        totalKontrak: number;
        nilaiKontrak: number;
    };
    locations: Array<{
        id: number;
        nama_paket: string;
        lat: number | null;
        lng: number | null;
    }>;
    recentTodos?: Array<{
        id: number;
        title: string;
        completed: boolean;
        created_at: string;
    }>;
    tahun_aktif: number;
    isSuperAdmin: boolean;
}

export default function Dashboard({ auth, stats, recentPekerjaan, progressData, kontrakStats, locations, recentTodos, tahun_aktif, isSuperAdmin }: DashboardProps) {
    return (
        <AuthenticatedLayout user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {isSuperAdmin && stats && recentPekerjaan && progressData && kontrakStats && recentTodos && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Pekerjaan</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalPekerjaan}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Kegiatan</CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalKegiatan}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Penerima Manfaat</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalPenerima}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Realisasi Keuangan</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatRupiah(stats.realisasiKeuangan)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Kontrak</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{kontrakStats.totalKontrak}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Nilai Kontrak</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatRupiah(kontrakStats.nilaiKontrak)}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Progres Fisik dan Keuangan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={progressData}>
                                                <XAxis
                                                    dataKey="nama_paket"
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `${value}%`}
                                                />
                                                <Tooltip formatter={(value: number) => `${value}%`} />
                                                <Legend />
                                                <Bar dataKey="realisasi_fisik" fill="#8884d8" name="Realisasi Fisik" />
                                                <Bar dataKey="realisasi_keuangan" fill="#82ca9d" name="Realisasi Keuangan" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Pekerjaan Terbaru</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {recentPekerjaan.map((pekerjaan) => (
                                                <li key={pekerjaan.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                                                    <Link href={route('pekerjaan.show', pekerjaan.id)} className="text-blue-600 hover:underline">
                                                        <p className="font-medium">{pekerjaan.nama_paket}</p>
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground">{pekerjaan.kecamatan} - {pekerjaan.desa}</p>
                                                    <p className="text-sm text-muted-foreground">Pagu: {formatRupiah(pekerjaan.pagu)}</p>
                                                    <p className="text-xs text-muted-foreground">Dibuat: {pekerjaan.created_at}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Todo Terbaru</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {recentTodos.length > 0 ? (
                                                recentTodos.map((todo) => (
                                                    <li key={todo.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                                                        <Link href={route('todos.edit', todo.id)} className="text-blue-600 hover:underline">
                                                            <p className="font-medium">{todo.title}</p>
                                                        </Link>
                                                        <p className="text-sm text-muted-foreground">{todo.completed ? 'Selesai' : 'Belum Selesai'}</p>
                                                        <p className="text-xs text-muted-foreground">Dibuat: {new Date(todo.created_at).toLocaleDateString()}</p>
                                                    </li>
                                                ))
                                            ) : (
                                                <p className="text-center text-muted-foreground">Tidak ada todo terbaru.</p>
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}

                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-8">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Peta Lokasi Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MapComponent photos={Array.isArray(locations) ? locations.map(l => ({ ...l, pekerjaan_id: l.id, keterangan: '' })) : []} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
