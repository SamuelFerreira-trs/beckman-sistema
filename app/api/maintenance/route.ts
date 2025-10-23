import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { maintenanceSchema } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    let maintenances
    if (query) {
      const searchTerm = `%${query}%`
      maintenances = await sql`
        SELECT 
          m.*,
          json_build_object('id', c.id, 'name', c.name) as client
        FROM maintenance_orders m
        JOIN clients c ON m.client_id = c.id
        WHERE 
          m.service_title ILIKE ${searchTerm} OR
          m.equipment ILIKE ${searchTerm} OR
          m.description ILIKE ${searchTerm} OR
          c.name ILIKE ${searchTerm}
        ORDER BY m.opened_at DESC
      `
    } else {
      maintenances = await sql`
        SELECT 
          m.*,
          json_build_object('id', c.id, 'name', c.name) as client
        FROM maintenance_orders m
        JOIN clients c ON m.client_id = c.id
        ORDER BY m.opened_at DESC
      `
    }

    return NextResponse.json(maintenances)
  } catch (error) {
    console.error("Error fetching maintenances:", error)
    return NextResponse.json({ error: "Erro ao buscar manutenções" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = maintenanceSchema.parse(body)

    const id = `maint_${Date.now()}`
    const now = new Date()
    const nextReminderAt = new Date(now)
    nextReminderAt.setMonth(nextReminderAt.getMonth() + 4)

    await sql`
      INSERT INTO maintenance_orders (
        id, client_id, equipment, service_title, description, 
        value, internal_cost, status, opened_at, next_reminder_at, 
        next_reminder_step, created_at, updated_at
      )
      VALUES (
        ${id},
        ${validatedData.clientId},
        ${validatedData.equipment || null},
        ${validatedData.serviceTitle},
        ${validatedData.description},
        ${validatedData.value},
        ${validatedData.internalCost || null},
        'ABERTA',
        ${now},
        ${nextReminderAt},
        'M4',
        ${now},
        ${now}
      )
    `

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error creating maintenance:", error)
    return NextResponse.json({ error: "Erro ao criar manutenção" }, { status: 500 })
  }
}
