import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")

    if (!month) {
      return NextResponse.json({ error: "Mês não informado" }, { status: 400 })
    }

    const [year, monthNum] = month.split("-")
    const startDate = new Date(Number(year), Number(monthNum) - 1, 1)
    const endDate = new Date(Number(year), Number(monthNum), 0, 23, 59, 59)

    const result = await sql`
      SELECT 
        COALESCE(SUM(value), 0) as total_revenue,
        COALESCE(
          SUM(
            (
              SELECT COALESCE(SUM((cost->>'value')::numeric), 0)
              FROM jsonb_array_elements(COALESCE(costs, '[]'::jsonb)) AS cost
            )
          ), 
          0
        ) as total_costs,
        COUNT(*) as order_count
      FROM maintenance_orders
      WHERE start_date >= ${startDate} AND start_date <= ${endDate}
      AND status IN ('COMPLETED', 'CONCLUIDA')
    `

    const summary = {
      totalRevenue: Number(result[0].total_revenue),
      totalCosts: Number(result[0].total_costs),
      netGain: Number(result[0].total_revenue) - Number(result[0].total_costs),
      orderCount: Number(result[0].order_count),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar resumo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
