"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, DollarSign, Receipt, ShoppingBag } from 'lucide-react'
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
          const contentType = response.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          } else {
            throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`)
          }
        }

        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          throw new Error("A resposta da API não é JSON. Verifique se a rota /api/maintenance/summary existe.")
        }

        const data = await response.json()
        setSummary(data)
      } catch (error) {
        console.error("Summary fetch error:", error)
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
          <Card key={i} className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/20 p-2">
            <Receipt className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">Erro ao carregar resumo financeiro</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Verifique se as tabelas do banco de dados foram criadas executando os scripts SQL.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const profitMargin = summary.totalRevenue > 0 
    ? ((summary.netGain / summary.totalRevenue) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="border-l-4 border-l-primary bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-foreground mb-1 text-2xl">
            {summary.totalRevenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custos Internos</CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2">
              <Receipt className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-foreground mb-1 text-2xl">
            {summary.totalCosts.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <p className="text-xs text-muted-foreground">Gastos operacionais</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganho Líquido</CardTitle>
            <div className="rounded-full bg-green-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-green-500 mb-1 text-2xl">
            {summary.netGain.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <p className="text-xs text-muted-foreground">Margem de {profitMargin}%</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ordens</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-foreground mb-1 text-2xl">{summary.orderCount}</div>
          <p className="text-xs text-muted-foreground">Manutenções registradas</p>
        </CardContent>
      </Card>
    </div>
  )
}
