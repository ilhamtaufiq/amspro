import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Package, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MapComponent from '@/components/MapComponent';
import { DashboardStats } from '@/components/dashboard-stats';
import { DashboardCharts } from '@/components/dashboard-charts';
import { RecentActivity } from '@/components/recent-activity';
import { GlobalSearch } from '@/components/global-search';
import { QuickActions } from '@/components/quick-actions';
import { CalendarWidget } from '@/components/calendar-widget';
import { useState } from 'react';

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
        pekerjaanTanpaFoto: Array<{ id: number; nama_paket: string }>;
        pekerjaanTanpaPenerima: Array<{ id: number; nama_paket: string }>;
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
    // State for minimize functionality - menggunakan satu set state untuk semua user
    const [isFotoMinimized, setIsFotoMinimized] = useState(true);
    const [isPenerimaMinimized, setIsPenerimaMinimized] = useState(true);

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
        <AuthenticatedLayout user={auth.user} header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {isSuperAdmin && recentPekerjaan && progressData && kontrakStats && recentTodos && (
                        <>
                            {/* Modern Stats Cards */}
                            <div className="mb-8">
                                <DashboardStats stats={dashboardStats} />
                            </div>

                            {/* Warning Cards for 0 Photos and 0 Penerima */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
                                <Card className="bg-yellow-100 border-yellow-400 text-yellow-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <CardTitle className="text-sm font-medium">Pekerjaan Tanpa Foto</CardTitle>
                                            <Package className="h-4 w-4 text-yellow-800" />
                                        </div>
                                        <button
                                            onClick={() => setIsFotoMinimized(!isFotoMinimized)}
                                            className="p-1 hover:bg-yellow-200 rounded transition-colors"
                                            title={isFotoMinimized ? "Klik untuk melihat detail" : "Klik untuk menyembunyikan detail"}
                                        >
                                            {isFotoMinimized ? (
                                                <ChevronDown className="h-4 w-4 text-yellow-800" />
                                            ) : (
                                                <ChevronUp className="h-4 w-4 text-yellow-800" />
                                            )}
                                        </button>
                                    </CardHeader>
                                    <CardContent className={isFotoMinimized ? "pb-2" : ""}>
                                        {isFotoMinimized ? (
                                            // Tampilan minimize - hanya ringkasan
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold">{stats.pekerjaanTanpaFoto.length}</div>
                                                    <p className="text-xs text-yellow-700">Pekerjaan tanpa foto</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-yellow-600">
                                                        {stats.pekerjaanTanpaFoto.length > 0 
                                                            ? `${stats.pekerjaanTanpaFoto.length} item` 
                                                            : "Tidak ada data"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Tampilan expand - detail lengkap
                                            <div>
                                                <div className="text-2xl font-bold">{stats.pekerjaanTanpaFoto.length}</div>
                                                <p className="text-xs text-yellow-700">Pekerjaan yang belum memiliki foto</p>
                                                {stats.pekerjaanTanpaFoto.length > 0 && (
                                                    <ul className="mt-2 text-sm text-yellow-800">
                                                        {stats.pekerjaanTanpaFoto.map((pekerjaan) => (
                                                            <li key={pekerjaan.id}>{pekerjaan.nama_paket}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="bg-yellow-100 border-yellow-400 text-yellow-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <CardTitle className="text-sm font-medium">Pekerjaan Tanpa Penerima</CardTitle>
                                            <Users className="h-4 w-4 text-yellow-800" />
                                        </div>
                                        <button
                                            onClick={() => setIsPenerimaMinimized(!isPenerimaMinimized)}
                                            className="p-1 hover:bg-yellow-200 rounded transition-colors"
                                            title={isPenerimaMinimized ? "Klik untuk melihat detail" : "Klik untuk menyembunyikan detail"}
                                        >
                                            {isPenerimaMinimized ? (
                                                <ChevronDown className="h-4 w-4 text-yellow-800" />
                                            ) : (
                                                <ChevronUp className="h-4 w-4 text-yellow-800" />
                                            )}
                                        </button>
                                    </CardHeader>
                                    <CardContent className={isPenerimaMinimized ? "pb-2" : ""}>
                                        {isPenerimaMinimized ? (
                                            // Tampilan minimize - hanya ringkasan
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold">{stats.pekerjaanTanpaPenerima.length}</div>
                                                    <p className="text-xs text-yellow-700">Pekerjaan tanpa penerima</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-yellow-600">
                                                        {stats.pekerjaanTanpaPenerima.length > 0 
                                                            ? `${stats.pekerjaanTanpaPenerima.length} item` 
                                                            : "Tidak ada data"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Tampilan expand - detail lengkap
                                            <div>
                                                <div className="text-2xl font-bold">{stats.pekerjaanTanpaPenerima.length}</div>
                                                <p className="text-xs text-yellow-700">Pekerjaan yang belum memiliki penerima</p>
                                                {stats.pekerjaanTanpaPenerima.length > 0 && (
                                                    <ul className="mt-2 text-sm text-yellow-800">
                                                        {stats.pekerjaanTanpaPenerima.map((pekerjaan) => (
                                                            <li key={pekerjaan.id}>{pekerjaan.nama_paket}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
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
                    {!isSuperAdmin && stats && (
                        <>
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8 mt-8">
                         <Card className="bg-yellow-100 border-yellow-400 text-yellow-800">
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                 <div className="flex items-center space-x-2">
                                     <CardTitle className="text-sm font-medium">Pekerjaan Tanpa Foto</CardTitle>
                                     <Package className="h-4 w-4 text-yellow-800" />
                                 </div>
                                 <button
                                     onClick={() => setIsFotoMinimized(!isFotoMinimized)}
                                     className="p-1 hover:bg-yellow-200 rounded transition-colors"
                                     title={isFotoMinimized ? "Klik untuk melihat detail" : "Klik untuk menyembunyikan detail"}
                                 >
                                     {isFotoMinimized ? (
                                         <ChevronDown className="h-4 w-4 text-yellow-800" />
                                     ) : (
                                         <ChevronUp className="h-4 w-4 text-yellow-800" />
                                     )}
                                 </button>
                             </CardHeader>
                             <CardContent className={isFotoMinimized ? "pb-2" : ""}>
                                 {isFotoMinimized ? (
                                     // Tampilan minimize - hanya ringkasan
                                     <div className="flex items-center justify-between">
                                         <div>
                                             <div className="text-2xl font-bold">{stats.pekerjaanTanpaFoto.length}</div>
                                             <p className="text-xs text-yellow-700">Pekerjaan tanpa foto</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-xs text-yellow-600">
                                                 {stats.pekerjaanTanpaFoto.length > 0 
                                                     ? `${stats.pekerjaanTanpaFoto.length} item` 
                                                     : "Tidak ada data"}
                                             </p>
                                         </div>
                                     </div>
                                 ) : (
                                     // Tampilan expand - detail lengkap
                                     <div>
                                         <div className="text-2xl font-bold">{stats.pekerjaanTanpaFoto.length}</div>
                                         <p className="text-xs text-yellow-700">Pekerjaan yang belum memiliki foto</p>
                                         {stats.pekerjaanTanpaFoto.length > 0 && (
                                             <ul className="mt-2 text-sm text-yellow-800">
                                                 {stats.pekerjaanTanpaFoto.map((pekerjaan) => (
                                                     <li key={pekerjaan.id}>{pekerjaan.nama_paket}</li>
                                                 ))}
                                             </ul>
                                         )}
                                     </div>
                                 )}
                             </CardContent>
                         </Card>
                         <Card className="bg-yellow-100 border-yellow-400 text-yellow-800">
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                 <div className="flex items-center space-x-2">
                                     <CardTitle className="text-sm font-medium">Pekerjaan Tanpa Penerima</CardTitle>
                                     <Users className="h-4 w-4 text-yellow-800" />
                                 </div>
                                 <button
                                     onClick={() => setIsPenerimaMinimized(!isPenerimaMinimized)}
                                     className="p-1 hover:bg-yellow-200 rounded transition-colors"
                                     title={isPenerimaMinimized ? "Klik untuk melihat detail" : "Klik untuk menyembunyikan detail"}
                                 >
                                     {isPenerimaMinimized ? (
                                         <ChevronDown className="h-4 w-4 text-yellow-800" />
                                     ) : (
                                         <ChevronUp className="h-4 w-4 text-yellow-800" />
                                     )}
                                 </button>
                             </CardHeader>
                             <CardContent className={isPenerimaMinimized ? "pb-2" : ""}>
                                 {isPenerimaMinimized ? (
                                     // Tampilan minimize - hanya ringkasan
                                     <div className="flex items-center justify-between">
                                         <div>
                                             <div className="text-2xl font-bold">{stats.pekerjaanTanpaPenerima.length}</div>
                                             <p className="text-xs text-yellow-700">Pekerjaan tanpa penerima</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-xs text-yellow-600">
                                                 {stats.pekerjaanTanpaPenerima.length > 0 
                                                     ? `${stats.pekerjaanTanpaPenerima.length} item` 
                                                     : "Tidak ada data"}
                                             </p>
                                         </div>
                                     </div>
                                 ) : (
                                     // Tampilan expand - detail lengkap
                                     <div>
                                         <div className="text-2xl font-bold">{stats.pekerjaanTanpaPenerima.length}</div>
                                         <p className="text-xs text-yellow-700">Pekerjaan yang belum memiliki penerima</p>
                                         {stats.pekerjaanTanpaPenerima.length > 0 && (
                                             <ul className="mt-2 text-sm text-yellow-800">
                                                 {stats.pekerjaanTanpaPenerima.map((pekerjaan) => (
                                                     <li key={pekerjaan.id}>{pekerjaan.nama_paket}</li>
                                                 ))}
                                             </ul>
                                         )}
                                     </div>
                                 )}
                             </CardContent>
                         </Card>
                        </div>
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
                        
                     </>    
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}