import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const maintenances = await sql`
      SELECT 
        m.*,
        json_build_object('name', c.name) as client
      FROM maintenance_orders m
      JOIN clients c ON m.client_id = c.id
      ORDER BY m.opened_at DESC
      LIMIT 5
    `
    return NextResponse.json(maintenances)
  } catch (error) {
    console.error("Error fetching recent maintenances:", error)
    return NextResponse.json({ error: "Erro ao buscar manutenções recentes" }, { status: 500 })
  }
}
