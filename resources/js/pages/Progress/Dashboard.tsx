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
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Define types for props
interface Summary {
    overall_progress: number;
    total_pekerjaan: number;
    pekerjaan_selesai: number;
    pekerjaan_berjalan: number;
}

interface StatusCounts {
    kritis: number;
    terlambat: number;
    sesuai: number;
    cepat: number;
    selesai: number;
}

interface ChartProgressByKegiatan {
    name: string;
    progress: number;
}

interface ProgressDashboardProps extends PageProps {
    summary: Summary;
    statusCounts: StatusCounts;
    chartProgressByKegiatan: ChartProgressByKegiatan[];
    filters: { tahun: number };
}

const COLORS = { 
    sesuai: '#22c55e', // green-500
    cepat: '#3b82f6', // blue-500
    terlambat: '#f97316', // orange-500
    kritis: '#ef4444', // red-500
    selesai: '#8b5cf6', // violet-500
};

export default function ProgressDashboard({ auth, summary, statusCounts, chartProgressByKegiatan, filters }: ProgressDashboardProps) {

    const pieData = Object.entries(statusCounts)
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value }));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Progress Fisik" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard Progress Fisik</h1>
                    <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                        <span className="font-semibold">Tahun Anggaran: {filters.tahun}</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress Fisik Total</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.overall_progress}%</div>
                            <p className="text-xs text-muted-foreground">Rata-rata tertimbang berdasarkan pagu</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pekerjaan</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_pekerjaan}</div>
                            <p className="text-xs text-muted-foreground">Jumlah paket pekerjaan di tahun {filters.tahun}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pekerjaan Selesai</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.pekerjaan_selesai}</div>
                            <p className="text-xs text-muted-foreground">dari {summary.total_pekerjaan} pekerjaan</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pekerjaan Berjalan</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.pekerjaan_berjalan}</div>
                            <p className="text-xs text-muted-foreground">Pekerjaan dengan progress &lt; 100%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Progress Rata-rata per Kegiatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartProgressByKegiatan} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                                    <YAxis unit="%" />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                                    <Legend />
                                    <Bar dataKey="progress" fill="#3b82f6" name="Progress Fisik" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Distribusi Status Pekerjaan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
