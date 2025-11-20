"use client"

import { Suspense } from "react"
import { Plus, FileText, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { MaintenancesTable } from "@/components/maintenances/maintenances-table"
import { MaintenanceSummaryCards } from "@/components/maintenances/maintenance-summary-cards"
import { MaintenanceFormDrawer } from "@/components/maintenances/maintenance-form-drawer"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ManutencoesPage() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative border-b border-border bg-gradient-to-br from-card via-card to-secondary/10 px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Manutenções</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Gerencie suas ordens de serviço, acompanhe faturamento e otimize processos
            </p>
          </div>
          <MaintenanceFormDrawer mode="create" open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2">
              <Plus className="h-5 w-5" />
              Nova manutenção
            </Button>
          </MaintenanceFormDrawer>
        </div>
      </div>

      <div className="flex-1 p-8">
        <Tabs defaultValue="overview" className="space-y-10">
          <TabsList className="bg-card border border-border py-0 my-0">
            <TabsTrigger value="overview" className="gap-2 px-1 py-1">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2 mt-0 ml-2 px-1 py-1">
              <FileText className="h-4 w-4" />
              Todas as Manutenções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Resumo Mensal</h2>
              <Suspense
                fallback={
                  <div className="grid gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-32 bg-card animate-pulse rounded-lg border border-border" />
                    ))}
                  </div>
                }
              >
                <MaintenanceSummaryCards />
              </Suspense>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Manutenções Recentes</h2>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <div className="h-10 bg-card animate-pulse rounded border border-border" />
                    <div className="h-64 bg-card animate-pulse rounded border border-border" />
                  </div>
                }
              >
                <MaintenancesTable />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Histórico Completo</h2>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <div className="h-10 bg-card animate-pulse rounded border border-border" />
                    <div className="h-96 bg-card animate-pulse rounded border border-border" />
                  </div>
                }
              >
                <MaintenancesTable />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
