import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { clientSchema } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    let clients
    if (query) {
      const searchTerm = `%${query}%`
      clients = await sql`
        SELECT * FROM clients
        WHERE 
          name ILIKE ${searchTerm} OR
          phone ILIKE ${searchTerm} OR
          email ILIKE ${searchTerm}
        ORDER BY created_at DESC
      `
    } else {
      clients = await sql`
        SELECT * FROM clients
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    const id = `client_${Date.now()}`
    const now = new Date()

    await sql`
      INSERT INTO clients (id, name, phone, email, created_at, updated_at)
      VALUES (
        ${id},
        ${validatedData.name},
        ${validatedData.phone},
        ${validatedData.email || null},
        ${now},
        ${now}
      )
    `

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
