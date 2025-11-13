"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MonthlySummary } from "@/lib/types"

export function MaintenanceSummaryCards() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7)
        const response = await fetch(`/api/maintenance/summary?month=${currentMonth}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setSummary(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro ao carregar resumo")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-t-2 border-t-primary bg-card border-border">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Erro ao carregar resumo: {error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Verifique se as tabelas do banco de dados foram criadas executando os scripts SQL.
        </p>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="border-t-2 border-t-primary bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {summary.totalRevenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-primary bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Custos Internos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {summary.totalCosts.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-primary bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Ganho Líquido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {summary.netGain.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-primary bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ordens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{summary.orderCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
