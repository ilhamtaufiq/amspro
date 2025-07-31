"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  FileText, 
  Users, 
  Building2, 
  MapPin, 
  Settings,
  BarChart3,
  Calendar,
  CheckSquare
} from "lucide-react"
import { router } from "@inertiajs/react"

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  route: string
  color: string
  bgColor: string
}

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {

  const actions: QuickAction[] = [
    {
      title: "Tambah Pekerjaan",
      description: "Buat pekerjaan baru",
      icon: Plus,
      route: "/pekerjaan/create",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Tambah Kegiatan",
      description: "Buat kegiatan baru",
      icon: Building2,
      route: "/kegiatan/create",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Tambah User",
      description: "Buat user baru",
      icon: Users,
      route: "/users/create",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Tambah Kontrak",
      description: "Buat kontrak baru",
      icon: FileText,
      route: "/kontrak/create",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Tambah Todo",
      description: "Buat todo baru",
      icon: CheckSquare,
      route: "/todos/create",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950"
    },
    {
      title: "Lihat Peta",
      description: "Lihat lokasi pekerjaan",
      icon: MapPin,
      route: "/map",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950"
    },
    {
      title: "Laporan",
      description: "Generate laporan",
      icon: BarChart3,
      route: "/reports",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950"
    },
    {
      title: "Kalender",
      description: "Lihat jadwal",
      icon: Calendar,
      route: "/calendar",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950"
    }
  ]

  const handleActionClick = (route: string) => {
    router.visit(route)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Akses cepat ke fitur-fitur utama
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200"
                onClick={() => handleActionClick(action.route)}
              >
                <div className={`p-3 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 