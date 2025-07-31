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
    stats: {
        totalPekerjaan: number;
        totalKegiatan: number;
        totalPenerima: number;
        realisasiKeuangan: number;
        totalUsers: number;
        completedPekerjaan: number;
        pendingPekerjaan: number;
        activeKontrak: number;
        totalPenyedia: number;
    };
    recentPekerjaan: Array<{
        id: number;
        nama_paket: string;
        pagu: number;
        kecamatan: string;
        desa: string;
        created_at: string;
    }>;
    progressData: Array<{
        nama_paket: string;
        realisasi_fisik: number;
        realisasi_keuangan: number;
    }>;
    kontrakStats: {
        totalKontrak: number;
        nilaiKontrak: number;
    };
    locations: Array<{
        id: number;
        nama_paket: string;
        lat: number | null;
        lng: number | null;
    }>;
    recentTodos: Array<{
        id: number;
        title: string;
        completed: boolean;
        created_at: string;
    }>;
    tahun_aktif: number;
    isSuperAdmin: boolean;
    monthlyProgress: Array<{
        month: string;
        completed: number;
        target: number;
    }>;
    recentActivities: Array<any>;
    calendarEvents: Array<any>;
}

export default function Dashboard({ auth, stats, recentPekerjaan, progressData, kontrakStats, locations, recentTodos, tahun_aktif, isSuperAdmin, monthlyProgress, recentActivities, calendarEvents }: DashboardProps) {
    // Prepare data for new components
    const dashboardStats = {
        totalUsers: stats?.totalUsers || 0,
        totalKegiatan: stats?.totalKegiatan || 0,
        totalPekerjaan: stats?.totalPekerjaan || 0,
        completedPekerjaan: stats?.completedPekerjaan || 0,
        pendingPekerjaan: stats?.pendingPekerjaan || 0,
        totalKontrak: kontrakStats?.totalKontrak || 0,
        activeKontrak: stats?.activeKontrak || 0,
        totalPenyedia: stats?.totalPenyedia || 0
    };

    const pekerjaanData = progressData?.map(item => ({
        name: item.nama_paket,
        completed: item.realisasi_fisik,
        pending: 100 - item.realisasi_fisik,
        total: 100
    })) || [];

    const kegiatanData = [
        { name: 'Active', value: stats.totalKegiatan - stats.completedPekerjaan - stats.pendingPekerjaan },
        { name: 'Completed', value: stats.completedPekerjaan },
        { name: 'Pending', value: stats.pendingPekerjaan }
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