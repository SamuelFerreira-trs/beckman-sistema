"use client"

import { useState, useEffect } from "react"
import { FinancialChart } from "./financial-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { FinancialDataPoint } from "@/lib/types"
import { Loader2, DollarSign, TrendingUp, TrendingDown, CalendarRange, Filter } from "lucide-react"

export default function FinanceiroPage() {
  const [data, setData] = useState<FinancialDataPoint[]>([])
  const [loading, setLoading] = useState(false)

  // Default to current month view
  const today = new Date()
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

  const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0])
  const [granularity, setGranularity] = useState("month")
  const [status, setStatus] = useState("CONCLUIDA")

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/financeiro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          granularity,
          status,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        console.error("Failed to fetch financial data")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [startDate, endDate, granularity, status])

  // Calculate totals for summary cards
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalCosts = data.reduce((acc, curr) => acc + curr.costs, 0)
  const totalNetGain = data.reduce((acc, curr) => acc + curr.netGain, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Análise Financeira</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho financeiro da sua oficina.</p>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data Início
              </Label>
              <div className="relative">
                <CalendarRange className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 bg-background border-border/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data Fim
              </Label>
              <div className="relative">
                <CalendarRange className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 bg-background border-border/50 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="granularity"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Agrupamento
              </Label>
              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger id="granularity" className="bg-background border-border/50 focus:border-primary">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Diário</SelectItem>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="bg-background border-border/50 focus:border-primary">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONCLUIDA">Concluídas</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary bg-card shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary font-medium flex items-center gap-1 inline-flex">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </span>{" "}
              em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive bg-card shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custos Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalCosts)}</div>
            <p className="text-xs text-muted-foreground mt-1">Custos operacionais e peças</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 bg-card shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalNetGain)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Margem de lucro de {totalRevenue > 0 ? ((totalNetGain / totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="col-span-4 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Evolução Financeira</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data.length > 0 ? (
            <FinancialChart data={data} granularity={granularity} />
          ) : (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground flex-col gap-2">
              <CalendarRange className="h-10 w-10 opacity-20" />
              <p>Nenhum dado encontrado para o período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
