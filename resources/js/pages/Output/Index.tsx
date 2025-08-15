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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import axios from 'axios';

interface OutputPageProps {
  pekerjaanId?: string;
}

interface OutputData {
  id: number;
  pekerjaan_id: number;
  komponen: string;
  satuan: string;
  volume: number;
  created_at: string;
  updated_at: string;
}

export default function OutputIndex({ pekerjaanId }: OutputPageProps) {
  const [outputData, setOutputData] = useState<OutputData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch output data
        const response = await axios.get(`/pekerjaan/${pekerjaanId}/outputs`);
        setOutputData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching output data:', err);
        setError('Gagal memuat data output');
      } finally {
        setLoading(false);
      }
    };

    if (pekerjaanId) {
      fetchData();
    }
  }, [pekerjaanId]);

  // Prepare data for charts
  const barChartData = outputData.map(item => ({
    name: item.komponen,
    volume: item.volume,
    satuan: item.satuan
  }));

  // Group by satuan for pie chart
  const outputBySatuan = outputData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.satuan === item.satuan);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      acc.push({ satuan: item.satuan, count: 1 });
    }
    return acc;
  }, [] as { satuan: string; count: number }[]);

  // Colors for charts
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <AuthenticatedLayout
      user={{
        name: '',
        email: '',
        roles: [],
        permissions: []
      }}
      header="Output Pekerjaan"
    >
      <Head title="Output" />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Output Pekerjaan</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : outputData.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Belum ada data output untuk pekerjaan ini.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Summary Card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Ringkasan Output</CardTitle>
                <CardDescription>
                  Informasi ringkasan output pekerjaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Jumlah Komponen</p>
                    <p className="text-2xl font-bold">{outputData.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Jenis Satuan</p>
                    <p className="text-2xl font-bold">{outputBySatuan.length}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">
                      {outputData.reduce((sum, item) => sum + item.volume, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volume Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Volume per Komponen</CardTitle>
                <CardDescription>
                  Volume untuk setiap komponen output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        return [`${value} ${props.payload.satuan}`, name];
                      }}
                    />
                    <Bar dataKey="volume" fill="#3B82F6" name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Satuan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Satuan</CardTitle>
                <CardDescription>
                  Distribusi komponen berdasarkan satuan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={outputBySatuan}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="satuan"
                    >
                      {outputBySatuan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Distribusi Output</CardTitle>
                <CardDescription>
                  Visualisasi radar dari volume output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={barChartData.slice(0, 8)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar 
                      name="Volume" 
                      dataKey="volume" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        return [`${value} ${props.payload.satuan}`, name];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

