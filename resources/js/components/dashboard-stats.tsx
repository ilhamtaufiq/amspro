"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalUsers: number
    totalKegiatan: number
    totalPekerjaan: number
    completedPekerjaan: number
    pendingPekerjaan: number
    totalKontrak: number
    activeKontrak: number
    totalPenyedia: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Active users in system",
      icon: Users,
      trend: "+12%",
      trendUp: true,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Total Kegiatan",
      value: stats.totalKegiatan,
      description: "Active projects",
      icon: Building2,
      trend: "+8%",
      trendUp: true,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Total Pekerjaan",
      value: stats.totalPekerjaan,
      description: "All work items",
      icon: FileText,
      trend: "+15%",
      trendUp: true,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Completed",
      value: stats.completedPekerjaan,
      description: "Finished work items",
      icon: CheckCircle,
      trend: "+20%",
      trendUp: true,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950"
    },
    {
      title: "Pending",
      value: stats.pendingPekerjaan,
      description: "Work in progress",
      icon: Clock,
      trend: "-5%",
      trendUp: false,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Active Kontrak",
      value: stats.activeKontrak,
      description: "Running contracts",
      icon: FileText,
      trend: "+3%",
      trendUp: true,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950"
    },
    {
      title: "Total Penyedia",
      value: stats.totalPenyedia,
      description: "Service providers",
      icon: Building2,
      trend: "+7%",
      trendUp: true,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950"
    },
    {
      title: "Completion Rate",
      value: `${Math.round((stats.completedPekerjaan / stats.totalPekerjaan) * 100)}%`,
      description: "Overall progress",
      icon: TrendingUp,
      trend: "+2%",
      trendUp: true,
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              <div className="flex items-center mt-2">
                {card.trendUp ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 