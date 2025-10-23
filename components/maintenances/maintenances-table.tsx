"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, CheckCircle, Clock, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { EditMaintenanceDrawer } from "./edit-maintenance-drawer"
import { DeleteMaintenanceDialog } from "./delete-maintenance-dialog"
import { MaintenanceFilters, type FilterValues } from "./maintenance-filters"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { MaintenanceOS } from "@/lib/types"

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

  const fetchMaintenances = async () => {
    try {
      const response = await fetch("/api/maintenance")
      const data = await response.json()
      setMaintenances(data)
    } catch (error) {
      console.error("Error fetching maintenances:", error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data.map((c: any) => ({ id: c.id, name: c.name })))
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await Promise.all([fetchMaintenances(), fetchClients()])
      setLoading(false)
    }

    loadData()
  }, [])

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

  const handleMarkComplete = async (id: string) => {
    try {
      await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONCLUIDA" }),
      })
      await fetchMaintenances()
    } catch (error) {
      console.error("Error updating maintenance:", error)
    }
  }

  const handleAdvanceReminder = async (id: string, currentStep: string | null) => {
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
  }

  if (loading) {
    return <div className="text-muted-foreground">Carregando manutenções...</div>
  }

  return (
    <>
      <div className="mb-6">
        <MaintenanceFilters filters={filters} onFiltersChange={setFilters} clients={clients} />
      </div>

      {filteredMaintenances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-lg text-foreground">
            {maintenances.length === 0
              ? "Nenhuma manutenção cadastrada ainda."
              : "Nenhuma manutenção encontrada com os filtros aplicados."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {maintenances.length === 0 ? "Crie a primeira para começar!" : "Tente ajustar os filtros."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-secondary/50">
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Serviço</TableHead>
                <TableHead className="text-muted-foreground">Valor</TableHead>
                <TableHead className="text-muted-foreground">Custo</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Próximo Lembrete</TableHead>
                <TableHead className="text-right text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenances.map((maintenance) => (
                <TableRow key={maintenance.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="text-foreground">{formatDate(maintenance.openedAt)}</TableCell>
                  <TableCell className="font-medium text-foreground">{maintenance.client.name}</TableCell>
                  <TableCell className="text-foreground">{maintenance.serviceTitle}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(maintenance.value)}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(maintenance.internalCost)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        maintenance.status === "CONCLUIDA"
                          ? "bg-primary/20 text-primary"
                          : maintenance.status === "ABERTA"
                            ? "bg-accent/20 text-accent"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {maintenance.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {maintenance.nextReminderAt ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(maintenance.nextReminderAt)}
                        <span className="text-xs">({maintenance.nextReminderStep})</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:bg-secondary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => setEditingMaintenance(maintenance)}
                          className="text-foreground focus:bg-secondary focus:text-foreground"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {maintenance.status === "ABERTA" && (
                          <DropdownMenuItem
                            onClick={() => handleMarkComplete(maintenance.id)}
                            className="text-foreground focus:bg-secondary focus:text-foreground"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como concluída
                          </DropdownMenuItem>
                        )}
                        {maintenance.nextReminderStep && (
                          <DropdownMenuItem
                            onClick={() => handleAdvanceReminder(maintenance.id, maintenance.nextReminderStep)}
                            className="text-foreground focus:bg-secondary focus:text-foreground"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Avançar lembrete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          onClick={() =>
                            setDeletingMaintenance({ id: maintenance.id, title: maintenance.serviceTitle })
                          }
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingMaintenance && (
        <EditMaintenanceDrawer
          maintenance={editingMaintenance}
          open={!!editingMaintenance}
          onOpenChange={(open) => !open && setEditingMaintenance(null)}
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
