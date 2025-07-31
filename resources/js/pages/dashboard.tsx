import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Package, Activity } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MapComponent from '@/components/MapComponent';
import { DashboardStats } from '@/components/dashboard-stats';
import { DashboardCharts } from '@/components/dashboard-charts';
import { RecentActivity } from '@/components/recent-activity';
import { GlobalSearch } from '@/components/global-search';
import { QuickActions } from '@/components/quick-actions';
import { CalendarWidget } from '@/components/calendar-widget';

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
    // Prepare data for new components
    const dashboardStats = {
        totalUsers: 150, // You can get this from your backend
        totalKegiatan: stats?.totalKegiatan || 0,
        totalPekerjaan: stats?.totalPekerjaan || 0,
        completedPekerjaan: Math.floor((stats?.totalPekerjaan || 0) * 0.7), // Example calculation
        pendingPekerjaan: Math.floor((stats?.totalPekerjaan || 0) * 0.3), // Example calculation
        totalKontrak: kontrakStats?.totalKontrak || 0,
        activeKontrak: Math.floor((kontrakStats?.totalKontrak || 0) * 0.8), // Example calculation
        totalPenyedia: 25 // You can get this from your backend
    };

    const pekerjaanData = progressData?.map(item => ({
        name: item.nama_paket,
        completed: item.realisasi_fisik,
        pending: 100 - item.realisasi_fisik,
        total: 100
    })) || [];

    const kegiatanData = [
        { name: 'Active', value: Math.floor((stats?.totalKegiatan || 0) * 0.6) },
        { name: 'Completed', value: Math.floor((stats?.totalKegiatan || 0) * 0.3) },
        { name: 'Pending', value: Math.floor((stats?.totalKegiatan || 0) * 0.1) }
    ];

    const monthlyProgress = [
        { month: 'Jan', completed: 65, target: 80 },
        { month: 'Feb', completed: 72, target: 85 },
        { month: 'Mar', completed: 78, target: 90 },
        { month: 'Apr', completed: 85, target: 95 },
        { month: 'May', completed: 82, target: 100 },
        { month: 'Jun', completed: 88, target: 105 }
    ];

    const recentActivities = [
        {
            id: '1',
            type: 'pekerjaan' as const,
            title: 'New pekerjaan created',
            description: 'Pembangunan Jalan Desa Sukamaju has been created',
            user: { name: 'John Doe', initials: 'JD' },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'in-progress' as const
        },
        {
            id: '2',
            type: 'kegiatan' as const,
            title: 'Kegiatan updated',
            description: 'Infrastructure development status updated',
            user: { name: 'Jane Smith', initials: 'JS' },
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            status: 'completed' as const
        },
        {
            id: '3',
            type: 'kontrak' as const,
            title: 'Contract signed',
            description: 'New contract for road construction signed',
            user: { name: 'Mike Johnson', initials: 'MJ' },
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            status: 'completed' as const
        },
        {
            id: '4',
            type: 'user' as const,
            title: 'New user registered',
            description: 'New supervisor account created',
            user: { name: 'Admin', initials: 'AD' },
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            status: 'completed' as const
        }
    ];

    const calendarEvents = [
        {
            id: '1',
            title: 'Project Review Meeting',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            type: 'meeting' as const,
            description: 'Monthly project review with stakeholders'
        },
        {
            id: '2',
            title: 'Contract Deadline',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            type: 'deadline' as const,
            description: 'Submit final contract documents'
        },
        {
            id: '3',
            title: 'Milestone Achievement',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            type: 'milestone' as const,
            description: 'Road construction phase 1 completion'
        },
        {
            id: '4',
            title: 'Site Inspection',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            type: 'reminder' as const,
            description: 'Regular site inspection and progress check'
        }
    ];

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
                            {/* Modern Stats Cards */}
                            <div className="mb-8">
                                <DashboardStats stats={dashboardStats} />
                            </div>

                            {/* Charts Section */}
                            <div className="mb-8">
                                <DashboardCharts 
                                    pekerjaanData={pekerjaanData}
                                    kegiatanData={kegiatanData}
                                    monthlyProgress={monthlyProgress}
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8">
                                <QuickActions />
                            </div>

                            {/* Recent Activity, Calendar, and Map */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="lg:col-span-1">
                                    <RecentActivity activities={recentActivities} />
                                </div>
                                <div className="lg:col-span-1">
                                    <CalendarWidget events={calendarEvents} />
                                </div>
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Peta Lokasi Pekerjaan</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <MapComponent photos={Object.values(locations).map(l => ({ ...l, pekerjaan_id: l.id, keterangan: '' }))} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Legacy Cards for backward compatibility */}
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

                    {/* Map for non-super admin users */}
                    {!isSuperAdmin && (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-8">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Peta Lokasi Pekerjaan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MapComponent photos={Object.values(locations).map(l => ({ ...l, pekerjaan_id: l.id, keterangan: '' }))} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
