import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("[v0] Summary API called")
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    console.log("[v0] Month parameter:", month)

    if (!month) {
      return NextResponse.json({ error: "Mês não informado" }, { status: 400 })
    }

    const [year, monthNum] = month.split("-")
    const startDate = new Date(Number(year), Number(monthNum) - 1, 1)
    const endDate = new Date(Number(year), Number(monthNum), 0, 23, 59, 59)

    console.log("[v0] Date range:", { startDate, endDate })

    const result = await sql`
      SELECT 
        COALESCE(SUM(value), 0) as total_revenue,
        COALESCE(SUM(internal_cost), 0) as total_costs,
        COUNT(*) as order_count
      FROM maintenance_orders
      WHERE opened_at >= ${startDate} AND opened_at <= ${endDate}
      AND status = 'CONCLUIDA'
    `

    console.log("[v0] Query result:", result)

    const summary = {
      totalRevenue: Number(result[0].total_revenue),
      totalCosts: Number(result[0].total_costs),
      netGain: Number(result[0].total_revenue) - Number(result[0].total_costs),
      orderCount: Number(result[0].order_count),
    }

    console.log("[v0] Summary calculated:", summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[v0] Error fetching summary:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar resumo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
