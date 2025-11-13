"use client"

import { Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MaintenancesTable } from "@/components/maintenances/maintenances-table"
import { MaintenanceSummaryCards } from "@/components/maintenances/maintenance-summary-cards"
import { MaintenanceFormDrawer } from "@/components/maintenances/maintenance-form-drawer"
import { useState } from "react"

export default function ManutencoesPage() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Manutenções</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerencie ordens de serviço e acompanhe o faturamento</p>
          </div>
          <MaintenanceFormDrawer mode="create" open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova manutenção
            </Button>
          </MaintenanceFormDrawer>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
          <MaintenanceSummaryCards />
        </Suspense>

        <div className="mt-8">
          <Suspense fallback={<div className="text-muted-foreground">Carregando...</div>}>
            <MaintenancesTable />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
