"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { MaintenanceOS } from "@/lib/types"

interface MaintenanceWithClient extends MaintenanceOS {
  client: {
    name: string
  }
}

export function RecentMaintenances() {
  const [maintenances, setMaintenances] = useState<MaintenanceWithClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMaintenances() {
      try {
        const response = await fetch("/api/dashboard/recent-maintenances")
        const data = await response.json()
        setMaintenances(data)
      } catch (error) {
        console.error("Error fetching recent maintenances:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenances()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Carregando manutenções...</div>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Manutenções Recentes</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-secondary">
          <Link href="/dashboard/manutencoes">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {maintenances.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma manutenção registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {maintenances.map((maintenance) => (
              <div
                key={maintenance.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{maintenance.serviceTitle}</p>
                  <p className="text-sm text-muted-foreground">{maintenance.client.name}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="font-medium text-foreground">{formatCurrency(maintenance.value)}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      maintenance.status === "CONCLUIDA"
                        ? "bg-primary/20 text-primary"
                        : maintenance.status === "ABERTA"
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {maintenance.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
