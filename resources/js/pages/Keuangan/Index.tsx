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

interface KeuanganPageProps {
  pekerjaanId?: string;
}

interface KeuanganData {
  id: number;
  pekerjaan_id: number;
  realisasi: number;
  created_at: string;
  updated_at: string;
}

interface KontrakData {
  id: number;
  id_pekerjaan: number;
  nilai_kontrak: number;
  nomor_kontrak: string;
  tanggal_kontrak: string;
}

export default function KeuanganIndex({ pekerjaanId }: KeuanganPageProps) {
  const [keuanganData, setKeuanganData] = useState<KeuanganData | null>(null);
  const [kontrakData, setKontrakData] = useState<KontrakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch keuangan data
        const keuanganResponse = await axios.get(`/pekerjaan/${pekerjaanId}/keuangan`);
        setKeuanganData(keuanganResponse.data);
        
        // Fetch kontrak data to get nilai_kontrak
        // Note: This is a mock API endpoint, adjust according to your actual API
        const kontrakResponse = await axios.get(`/pekerjaan/${pekerjaanId}/kontrak`);
        setKontrakData(kontrakResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching keuangan data:', err);
        setError('Gagal memuat data keuangan');
      } finally {
        setLoading(false);
      }
    };

    if (pekerjaanId) {
      fetchData();
    }
  }, [pekerjaanId]);

  // Calculate percentages and prepare chart data
  const nilaiKontrak = kontrakData?.nilai_kontrak || 0;
  const realisasi = keuanganData?.realisasi || 0;
  const sisa = Math.max(0, nilaiKontrak - realisasi);
  const persentaseRealisasi = nilaiKontrak > 0 ? (realisasi / nilaiKontrak) * 100 : 0;

  // Prepare data for charts
  const pieChartData = [
    { name: 'Realisasi', value: realisasi },
    { name: 'Sisa', value: sisa }
  ];

  // Mock data for monthly spending (in a real app, you would fetch this from your API)
  const monthlySpendingData = [
    { name: 'Jan', realisasi: 0 },
    { name: 'Feb', realisasi: 0 },
    { name: 'Mar', realisasi: 0 },
    { name: 'Apr', realisasi: 0 },
    { name: 'May', realisasi: 0 },
    { name: 'Jun', realisasi: 0 },
    { name: 'Jul', realisasi: 0 },
    { name: 'Aug', realisasi: 0 },
    { name: 'Sep', realisasi: 0 },
    { name: 'Oct', realisasi: 0 },
    { name: 'Nov', realisasi: 0 },
    { name: 'Dec', realisasi: realisasi }
  ];
  
  // Colors for pie chart
  const COLORS = ['#10B981', '#F59E0B'];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <AuthenticatedLayout
      user={{
        name: '',
        email: '',
        roles: [],
        permissions: []
      }}
      header="Keuangan Pekerjaan"
    >
      <Head title="Keuangan" />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Keuangan Pekerjaan</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : !keuanganData ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Belum ada data keuangan untuk pekerjaan ini.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Summary Card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Realisasi Anggaran</CardTitle>
                <CardDescription>
                  Ringkasan realisasi anggaran pekerjaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Nilai Kontrak</p>
                    <p className="text-2xl font-bold">{formatCurrency(nilaiKontrak)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Realisasi</p>
                    <p className="text-2xl font-bold">{formatCurrency(realisasi)}</p>
                    <p className="text-sm text-green-600">{persentaseRealisasi.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Sisa</p>
                    <p className="text-2xl font-bold">{formatCurrency(sisa)}</p>
                    <p className="text-sm text-orange-600">{(100 - persentaseRealisasi).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Anggaran</CardTitle>
                <CardDescription>
                  Perbandingan realisasi dan sisa anggaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Spending Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Realisasi Bulanan</CardTitle>
                <CardDescription>
                  Tren realisasi anggaran per bulan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={monthlySpendingData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="realisasi" fill="#10B981" name="Realisasi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

