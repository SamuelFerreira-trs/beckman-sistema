import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const now = new Date()

    if (body.status) {
      // Status update (mark as complete)
      if (body.status === "CONCLUIDA") {
        await sql`
          UPDATE maintenance_orders
          SET status = ${body.status}, closed_at = ${now}, updated_at = ${now}
          WHERE id = ${params.id}
        `
      }
    } else {
      // Full maintenance update (edit)
      const { clientId, equipment, serviceTitle, description, value, internalCost } = body

      await sql`
        UPDATE maintenance_orders
        SET 
          client_id = ${clientId},
          equipment = ${equipment || null},
          service_title = ${serviceTitle},
          description = ${description},
          value = ${value},
          internal_cost = ${internalCost || null},
          updated_at = ${now}
        WHERE id = ${params.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating maintenance:", error)
    return NextResponse.json({ error: "Erro ao atualizar manutenção" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await sql`
      DELETE FROM maintenance_orders
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting maintenance:", error)
    return NextResponse.json({ error: "Erro ao excluir manutenção" }, { status: 500 })
  }
}
