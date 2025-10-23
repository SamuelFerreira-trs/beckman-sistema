"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthlySummary } from "@/lib/types"

export function MaintenanceSummaryCards() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7)
        console.log("[v0] Fetching summary for month:", currentMonth)

        const response = await fetch(`/api/maintenance/summary?month=${currentMonth}`)

        console.log("[v0] Response status:", response.status)
        console.log("[v0] Response ok:", response.ok)

        if (!response.ok) {
          const text = await response.text()
          console.error("[v0] Error response:", text)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Summary data received:", data)
        setSummary(data)
      } catch (error) {
        console.error("[v0] Error fetching summary:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar resumo")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Carregando resumo...</div>
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
