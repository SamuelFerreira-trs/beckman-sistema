import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { startDate, endDate, granularity, status } = body

    // Validate inputs
    if (!startDate || !endDate || !granularity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    // Set end date to end of day
    end.setHours(23, 59, 59, 999)

    // Determine date truncation part for SQL
    let datePart = "month"
    if (granularity === "day") datePart = "day"
    if (granularity === "year") datePart = "year"

    // Build the query
    // We use COALESCE(delivery_date, opened_at) as the reference date
    // We sum value for revenue
    // We sum the values inside the costs JSONB array for costs

    let query = sql`
      SELECT
        date_trunc(${datePart}, COALESCE(delivery_date, opened_at)) as date,
        SUM(value) as revenue,
        SUM(
          (SELECT COALESCE(SUM((c->>'value')::numeric), 0) 
           FROM jsonb_array_elements(costs) as c)
        ) as costs
      FROM maintenance_orders
      WHERE COALESCE(delivery_date, opened_at) >= ${start}
        AND COALESCE(delivery_date, opened_at) <= ${end}
    `

    if (status === "CONCLUIDA") {
      query = sql`${query} AND status = 'CONCLUIDA'`
    }

    query = sql`${query} GROUP BY 1 ORDER BY 1`

    const result = await query

    const data = result.map((row) => {
      const revenue = Number(row.revenue) || 0
      const costs = Number(row.costs) || 0
      return {
        date: row.date, // Keep as ISO string or Date object from driver
        revenue,
        costs,
        netGain: revenue - costs,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching financial data:", error)
    return NextResponse.json({ error: "Erro ao buscar dados financeiros" }, { status: 500 })
  }
}
