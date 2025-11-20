"use client"

import Link from "next/link"
import { ArrowLeft, Mail, Phone, Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Client, MaintenanceOS } from "@/lib/types"
import { EditClientDialog } from "@/components/clients/edit-client-dialog"

interface ClientDetailViewProps {
  client: Client
  maintenances: MaintenanceOS[]
}

export function ClientDetailView({ client, maintenances }: ClientDetailViewProps) {
  const completedMaintenances = maintenances.filter((m) => m.status === "CONCLUIDA")
  const totalRevenue = completedMaintenances.reduce((sum, m) => sum + Number(m.value), 0)
  const totalCosts = completedMaintenances.reduce((sum, m) => sum + Number(m.internalCost || 0), 0)
  const netGain = totalRevenue - totalCosts

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="mb-4">
          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para clientes
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{client.name}</h1>
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {client.phone}
              </span>
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EditClientDialog client={client}>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </EditClientDialog>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova manutenção
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-t-2 border-t-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{maintenances.length}</div>
            </CardContent>
          </Card>

          <Card className="border-t-2 border-t-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card className="border-t-2 border-t-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Custos Internos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalCosts)}</div>
            </CardContent>
          </Card>

          <Card className="border-t-2 border-t-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Ganho Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(netGain)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenances list */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Histórico de Manutenções</h2>
          {maintenances.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhuma manutenção registrada para este cliente.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {maintenances.map((maintenance) => (
                <Card key={maintenance.id} className="border-l-2 border-l-primary bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{maintenance.serviceTitle}</h3>
                        {maintenance.equipment && (
                          <p className="mt-1 text-sm text-muted-foreground">{maintenance.equipment}</p>
                        )}
                        <p className="mt-2 text-sm text-foreground">{maintenance.description}</p>
                        <div className="mt-4 flex gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Valor:{" "}
                            <span className="font-medium text-foreground">{formatCurrency(maintenance.value)}</span>
                          </span>
                          {maintenance.internalCost && (
                            <span className="text-muted-foreground">
                              Custo:{" "}
                              <span className="font-medium text-foreground">
                                {formatCurrency(maintenance.internalCost)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            maintenance.status === "CONCLUIDA"
                              ? "bg-primary/20 text-primary"
                              : maintenance.status === "ABERTA"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {maintenance.status}
                        </span>
                        <p className="mt-2 text-sm text-muted-foreground">{formatDate(maintenance.openedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
