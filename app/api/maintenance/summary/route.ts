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
        COALESCE(SUM(CASE WHEN status IN ('COMPLETED', 'CONCLUIDA', 'Concluída') THEN value ELSE 0 END), 0) as total_revenue,
        COALESCE(
          SUM(
            CASE WHEN status IN ('COMPLETED', 'CONCLUIDA', 'Concluída') THEN
              (
                SELECT COALESCE(SUM((cost->>'value')::numeric), 0)
                FROM jsonb_array_elements(COALESCE(costs, '[]'::jsonb)) AS cost
              )
            ELSE 0 END
          ), 
          0
        ) as total_costs,
        COUNT(CASE WHEN status IN ('COMPLETED', 'CONCLUIDA', 'Concluída') THEN 1 END) as order_count,
        COUNT(*) as total_records
      FROM maintenance_orders
      WHERE (start_date >= ${startDate} AND start_date <= ${endDate})
         OR (created_at >= ${startDate} AND created_at <= ${endDate})
    `

    const summary = {
      totalRevenue: Number(result[0].total_revenue) || 0,
      totalCosts: Number(result[0].total_costs) || 0,
      netGain: (Number(result[0].total_revenue) || 0) - (Number(result[0].total_costs) || 0),
      orderCount: Number(result[0].order_count) || 0,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json(
      {
        totalRevenue: 0,
        totalCosts: 0,
        netGain: 0,
        orderCount: 0,
        error: "Erro ao buscar resumo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 with empty data instead of 500
    )
  }
}
