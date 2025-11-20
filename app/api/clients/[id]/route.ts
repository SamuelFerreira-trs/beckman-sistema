import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { clientSchema } from "@/lib/validations"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = clientSchema.parse(body)
    const now = new Date()

    await sql`
      UPDATE clients
      SET 
        name = ${validatedData.name},
        phone = ${validatedData.phone},
        email = ${validatedData.email || null},
        updated_at = ${now}
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}
