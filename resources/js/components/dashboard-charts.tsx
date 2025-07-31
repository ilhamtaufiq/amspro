"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"

interface DashboardChartsProps {
  pekerjaanData: Array<{
    name: string
    completed: number
    pending: number
    total: number
  }>
  kegiatanData: Array<{
    name: string
    value: number
  }>
  monthlyProgress: Array<{
    month: string
    completed: number
    target: number
  }>
}

export function DashboardCharts({ pekerjaanData, kegiatanData, monthlyProgress }: DashboardChartsProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {/* Pekerjaan Progress Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Pekerjaan Progress</CardTitle>
          <CardDescription>
            Progress pekerjaan per kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pekerjaanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Kegiatan Distribution */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Kegiatan Distribution</CardTitle>
          <CardDescription>
            Distribusi kegiatan berdasarkan status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kegiatanData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {kegiatanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Progress Trend */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Monthly Progress Trend</CardTitle>
          <CardDescription>
            Tren progress bulanan vs target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Completed"
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 