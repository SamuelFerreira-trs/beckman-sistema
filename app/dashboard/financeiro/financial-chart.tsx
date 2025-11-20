"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { FinancialDataPoint } from "@/lib/types"

interface FinancialChartProps {
  data: FinancialDataPoint[]
  granularity: string
}

export function FinancialChart({ data, granularity }: FinancialChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (granularity === "day") {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    } else if (granularity === "month") {
      return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    } else {
      return date.getFullYear().toString()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="h-[400px] w-full rounded-lg border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => `R$ ${value}`}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), ""]}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
              borderRadius: "var(--radius)",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Receita"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="costs"
            name="Custos"
            stroke="hsl(var(--destructive))"
            strokeWidth={3}
            dot={{ r: 4, fill: "hsl(var(--destructive))", strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="netGain"
            name="Lucro Líquido"
            stroke="#22c55e" // green-500 for clear profit indication
            strokeWidth={3}
            dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
