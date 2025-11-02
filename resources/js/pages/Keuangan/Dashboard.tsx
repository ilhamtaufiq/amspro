import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { formatRupiah } from '@/lib/utils';

// Define types for props
interface Summary {
    total_pagu: number;
    total_kontrak: number;
    total_realisasi: number;
    sisa_pagu: number;
    sisa_kontrak: number;
    persen_realisasi_pagu: number;
    persen_realisasi_kontrak: number;
}

interface MonthlySpending {
    name: string;
    realisasi: number;
}

interface ByKegiatan {
    nama_kegiatan: string;
    nilai_kontrak: number;
    realisasi: number;
}

interface KeuanganDashboardProps extends PageProps {
    summary: Summary;
    monthlySpending: MonthlySpending[];
    byKegiatan: ByKegiatan[];
    filters: { tahun: number };
}

export default function KeuanganDashboard({ auth, summary, monthlySpending, byKegiatan, filters }: KeuanganDashboardProps) {

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Keuangan" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard Keuangan</h1>
                    <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                        <span className="font-semibold">Tahun Anggaran: {filters.tahun}</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pagu Anggaran</CardTitle>
                            <span className="text-muted-foreground">💰</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(summary.total_pagu)}</div>
                            <p className="text-xs text-muted-foreground">Total pagu anggaran tahun {filters.tahun}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Nilai Kontrak</CardTitle>
                            <span className="text-muted-foreground">📄</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(summary.total_kontrak)}</div>
                            <p className="text-xs text-muted-foreground">Total kontrak yang dibuat</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Realisasi</CardTitle>
                            <span className="text-muted-foreground">💸</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(summary.total_realisasi)}</div>
                            <p className="text-xs text-muted-foreground">({summary.persen_realisasi_kontrak.toFixed(2)}% dari Kontrak)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sisa Anggaran (Kontrak)</CardTitle>
                            <span className="text-muted-foreground">🏦</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(summary.sisa_kontrak)}</div>
                            <p className="text-xs text-muted-foreground">Sisa dari nilai kontrak</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Realisasi Keuangan Bulanan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={monthlySpending} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} />
                                    <Tooltip formatter={(value: number) => formatRupiah(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="realisasi" stroke="#8884d8" name="Realisasi" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Kontrak vs Realisasi per Kegiatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={byKegiatan} margin={{ top: 5, right: 20, left: -10, bottom: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nama_kegiatan" angle={-45} textAnchor="end" interval={0} />
                                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} />
                                    <Tooltip formatter={(value: number) => formatRupiah(value)} />
                                    <Legend verticalAlign="top" />
                                    <Bar dataKey="nilai_kontrak" fill="#82ca9d" name="Nilai Kontrak" />
                                    <Bar dataKey="realisasi" fill="#8884d8" name="Realisasi" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
