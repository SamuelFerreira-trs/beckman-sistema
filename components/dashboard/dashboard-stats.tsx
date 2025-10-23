"use client"

import { useEffect, useState } from "react"
import { Users, FileText, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStatsData {
  totalClients: number
  totalMaintenances: number
  monthlyRevenue: number
  upcomingReminders: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-[#5c6166]">Carregando estatísticas...</div>
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-t-2 border-t-[#d3d655] bg-[#18191b] border-[#272a2d]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#5c6166]">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-[#d3d655]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#eceef0]">{stats.totalClients}</div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-[#d3d655] bg-[#18191b] border-[#272a2d]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#5c6166]">Manutenções (Mês)</CardTitle>
          <FileText className="h-4 w-4 text-[#d3d655]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#eceef0]">{stats.totalMaintenances}</div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-[#d3d655] bg-[#18191b] border-[#272a2d]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#5c6166]">Receita (Mês)</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#d3d655]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#d3d655]">
            {stats.monthlyRevenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-[#d3d655] bg-[#18191b] border-[#272a2d]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#5c6166]">Lembretes Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-[#d3d655]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#eceef0]">{stats.upcomingReminders}</div>
        </CardContent>
      </Card>
    </div>
  )
}
