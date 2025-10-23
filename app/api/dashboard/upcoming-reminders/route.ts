import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const reminders = await sql`
      SELECT 
        m.*,
        json_build_object('name', c.name) as client
      FROM maintenance_orders m
      JOIN clients c ON m.client_id = c.id
      WHERE m.next_reminder_at IS NOT NULL
      ORDER BY m.next_reminder_at ASC
      LIMIT 10
    `
    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error)
    return NextResponse.json({ error: "Erro ao buscar lembretes" }, { status: 500 })
  }
}
