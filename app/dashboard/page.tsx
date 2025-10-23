import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentClients } from "@/components/dashboard/recent-clients"
import { RecentMaintenances } from "@/components/dashboard/recent-maintenances"
import { UpcomingReminders } from "@/components/dashboard/upcoming-reminders"

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visão geral do seu negócio</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <Suspense fallback={<div className="text-muted-foreground">Carregando estatísticas...</div>}>
          <DashboardStats />
        </Suspense>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
            <RecentClients />
          </Suspense>

          <Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
            <UpcomingReminders />
          </Suspense>
        </div>

        <div className="mt-6">
          <Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
            <RecentMaintenances />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
