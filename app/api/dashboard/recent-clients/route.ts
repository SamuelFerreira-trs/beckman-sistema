import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const clients = await sql`
      SELECT * FROM clients
      ORDER BY created_at DESC
      LIMIT 5
    `
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching recent clients:", error)
    return NextResponse.json({ error: "Erro ao buscar clientes recentes" }, { status: 500 })
  }
}
