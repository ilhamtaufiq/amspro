import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import axios from 'axios';

interface ProgressPageProps {
  pekerjaanId?: string;
}

interface ProgressData {
  id: number;
  pekerjaan_id: number;
  komponen_id: number;
  realisasi_fisik: number;
  realisasi_keuangan: number | null;
  created_at: string;
  updated_at: string;
  output?: {
    id: number;
    komponen: string;
    volume: number;
    satuan: string;
  };
}

export default function ProgressIndex({ pekerjaanId }: ProgressPageProps) {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/pekerjaan/${pekerjaanId}/progress`);
        setProgressData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Gagal memuat data progress');
      } finally {
        setLoading(false);
      }
    };

    if (pekerjaanId) {
      fetchData();
    }
  }, [pekerjaanId]);

  // Prepare data for charts
  const progressBarData = progressData.map(item => ({
    name: item.output?.komponen || `Komponen ${item.komponen_id}`,
    realisasi: item.realisasi_fisik,
    target: 100, // Assuming target is 100%
  }));

  const progressPieData = [
    { name: 'Selesai', value: progressData.filter(item => item.realisasi_fisik >= 100).length },
    { name: 'Dalam Proses', value: progressData.filter(item => item.realisasi_fisik > 0 && item.realisasi_fisik < 100).length },
    { name: 'Belum Dimulai', value: progressData.filter(item => item.realisasi_fisik === 0).length },
  ];

  // Calculate overall progress
  const totalComponents = progressData.length;
  const completedComponents = progressData.filter(item => item.realisasi_fisik >= 100).length;
  const overallProgress = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;
  
  // Colors for pie chart
  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <AuthenticatedLayout
      user={{
        name: '',
        email: '',
        roles: [],
        permissions: []
      }}
      header="Progress Pekerjaan"
    >
      <Head title="Progress" />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Progress Pekerjaan</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : progressData.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Belum ada data progress untuk pekerjaan ini.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Progress Card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Progress Keseluruhan</CardTitle>
                <CardDescription>
                  Persentase keseluruhan progress pekerjaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">
                      {overallProgress.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {completedComponents} dari {totalComponents} komponen selesai
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progress per Komponen</CardTitle>
                <CardDescription>
                  Realisasi fisik untuk setiap komponen pekerjaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={progressBarData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="realisasi" fill="#10B981" name="Realisasi (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Komponen</CardTitle>
                <CardDescription>
                  Distribusi status komponen pekerjaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={progressPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {progressPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

