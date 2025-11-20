"use client"

import { useEffect, useState, useCallback } from "react"
import { MoreHorizontal, CheckCircle, Pencil, Trash2, AlertCircle, Clock, FileText } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MaintenanceFormDrawer } from "./maintenance-form-drawer"
import { DeleteMaintenanceDialog } from "./delete-maintenance-dialog"
import { MaintenanceFilters, type FilterValues } from "./maintenance-filters"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { MaintenanceOS } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface MaintenanceWithClient extends MaintenanceOS {
  client: {
    id: string
    name: string
  }
}

export function MaintenancesTable() {
  const [maintenances, setMaintenances] = useState<MaintenanceWithClient[]>([])
  const [filteredMaintenances, setFilteredMaintenances] = useState<MaintenanceWithClient[]>([])
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceWithClient | null>(null)
  const [deletingMaintenance, setDeletingMaintenance] = useState<{ id: string; title: string } | null>(null)

  const [filters, setFilters] = useState<FilterValues>({
    query: "",
    status: "all",
    clientId: "",
    dateFrom: "",
    dateTo: "",
    minValue: "",
    maxValue: "",
  })

  const fetchMaintenances = useCallback(async () => {
    try {
      const response = await fetch("/api/maintenance")
      const data = await response.json()
      
      const mappedData = data.map((item: any) => ({
        id: item.id,
        clientId: item.client_id,
        equipment: item.equipment,
        serviceTitle: item.service_title,
        description: item.description,
        value: Number(item.value),
        costs: item.costs || [],
        status: item.status,
        startDate: item.start_date,
        deliveryDate: item.delivery_date,
        nextMaintenanceDate: item.next_maintenance_date,
        openedAt: item.opened_at,
        nextReminderAt: item.next_reminder_at,
        nextReminderStep: item.next_reminder_step,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        client: item.client
      }))
      
      setMaintenances(mappedData)
    } catch (error) {
      console.error("Error fetching maintenances:", error)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data.map((c: any) => ({ id: c.id, name: c.name })))
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await Promise.all([fetchMaintenances(), fetchClients()])
      setLoading(false)
    }

    loadData()
  }, [fetchMaintenances, fetchClients])

  useEffect(() => {
    let filtered = [...maintenances]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.serviceTitle?.toLowerCase().includes(query) ||
          m.equipment?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.client?.name?.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((m) => m.status === filters.status)
    }

    // Client filter
    if (filters.clientId) {
      filtered = filtered.filter((m) => m.clientId === filters.clientId)
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((m) => new Date(m.openedAt) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((m) => new Date(m.openedAt) <= toDate)
    }

    // Value range filter
    if (filters.minValue) {
      filtered = filtered.filter((m) => Number(m.value) >= Number(filters.minValue))
    }
    if (filters.maxValue) {
      filtered = filtered.filter((m) => Number(m.value) <= Number(filters.maxValue))
    }

    setFilteredMaintenances(filtered)
  }, [maintenances, filters])

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N for new maintenance
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        // Trigger new maintenance from parent
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [])

  const handleMarkComplete = useCallback(
    async (id: string) => {
      // Optimistic update
      setMaintenances(prev => 
        prev.map(m => m.id === id ? { ...m, status: 'CONCLUIDA' as const } : m)
      )
      
      try {
        await fetch(`/api/maintenance/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONCLUIDA" }),
        })
        await fetchMaintenances()
      } catch (error) {
        console.error("Error updating maintenance:", error)
        // Revert optimistic update
        await fetchMaintenances()
      }
    },
    [fetchMaintenances],
  )

  const handleAdvanceReminder = useCallback(
    async (id: string, currentStep: string | null) => {
      try {
        const nextStep = currentStep === "M4" ? "M6" : null
        await fetch(`/api/maintenance/${id}/reminder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nextStep }),
        })
        await fetchMaintenances()
      } catch (error) {
        console.error("Error advancing reminder:", error)
      }
    },
    [fetchMaintenances],
  )

  const handleEdit = useCallback((maintenance: MaintenanceWithClient) => {
    setEditingMaintenance(maintenance)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-card animate-pulse rounded border border-border" />
        <div className="h-64 bg-card animate-pulse rounded border border-border" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <MaintenanceFilters filters={filters} onFiltersChange={setFilters} clients={clients} />
      </div>

      {filteredMaintenances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-16 text-center animate-in fade-in-0 zoom-in-95">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {maintenances.length === 0 ? "Nenhuma manutenção cadastrada" : "Nenhuma manutenção encontrada"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {maintenances.length === 0
              ? "Comece criando sua primeira ordem de serviço clicando no botão acima."
              : "Tente ajustar os filtros ou limpar a busca para ver mais resultados."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Exibindo <span className="font-medium text-foreground">{filteredMaintenances.length}</span> manutenção
              {filteredMaintenances.length === 1 ? "" : "es"}
            </p>
            <Badge variant="outline" className="gap-1.5">
              <Clock className="h-3 w-3" />
              Ordenado por data
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground font-semibold">Serviço</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Cliente</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Datas</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Valor</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.map((maintenance) => {
                  const isNextMaintenanceSoon = maintenance.nextMaintenanceDate
                    ? new Date(maintenance.nextMaintenanceDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                    : false

                  return (
                    <TableRow
                      key={maintenance.id}
                      className="border-border hover:bg-secondary/30 transition-colors duration-150"
                    >
                      <TableCell className="text-foreground">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {maintenance.serviceTitle || <span className="text-muted-foreground italic">Sem título</span>}
                          </span>
                          {maintenance.equipment && (
                            <span className="text-xs text-muted-foreground">
                              Equipamento: {maintenance.equipment}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{maintenance.client.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            maintenance.status === "CONCLUIDA"
                              ? "default"
                              : maintenance.status === "ABERTA"
                                ? "secondary"
                                : "destructive"
                          }
                          className={`gap-1.5 transition-all ${
                            maintenance.status === "CONCLUIDA"
                              ? "bg-green-500/20 text-green-500 border-green-500/30"
                              : maintenance.status === "ABERTA"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {maintenance.status === "CONCLUIDA" && <CheckCircle className="h-3 w-3" />}
                          {maintenance.status === "ABERTA" && <Clock className="h-3 w-3" />}
                          {maintenance.status === "CANCELADA" && <AlertCircle className="h-3 w-3" />}
                          {maintenance.status === "ABERTA"
                            ? "Aberta"
                            : maintenance.status === "CONCLUIDA"
                              ? "Concluída"
                              : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground font-medium">Início:</span>
                            <span className="font-medium">
                              {maintenance.startDate ? formatDate(maintenance.startDate) : "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground font-medium">Entrega:</span>
                            <span className="font-medium">
                              {maintenance.deliveryDate ? formatDate(maintenance.deliveryDate) : "-"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">{formatCurrency(maintenance.value)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:bg-secondary transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem
                              onClick={() => handleEdit(maintenance)}
                              className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer transition-all"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {maintenance.status === "ABERTA" && (
                              <DropdownMenuItem
                                onClick={() => handleMarkComplete(maintenance.id)}
                                className="text-foreground focus:bg-secondary focus:text-foreground cursor-pointer transition-all"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como concluída
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() =>
                                setDeletingMaintenance({ id: maintenance.id, title: maintenance.serviceTitle })
                              }
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-all"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {editingMaintenance && (
        <MaintenanceFormDrawer
          mode="edit"
          open={!!editingMaintenance}
          onOpenChange={(open) => {
            if (!open) setEditingMaintenance(null)
          }}
          initialData={editingMaintenance}
          onSuccess={fetchMaintenances}
        />
      )}

      {deletingMaintenance && (
        <DeleteMaintenanceDialog
          maintenanceId={deletingMaintenance.id}
          maintenanceTitle={deletingMaintenance.title}
          open={!!deletingMaintenance}
          onOpenChange={(open) => !open && setDeletingMaintenance(null)}
          onSuccess={fetchMaintenances}
        />
      )}
    </>
  )
}
