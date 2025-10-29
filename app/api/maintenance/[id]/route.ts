import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { calculateNextMaintenanceDate } from "@/lib/utils"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const now = new Date()

    if (body.status) {
      if (body.status === "CONCLUIDA") {
        const deliveryDate = body.deliveryDate ? new Date(body.deliveryDate) : now
        const nextMaintenanceDate = calculateNextMaintenanceDate(deliveryDate)

        await sql`
          UPDATE maintenance_orders
          SET 
            status = ${body.status}, 
            closed_at = ${now}, 
            delivery_date = ${deliveryDate},
            next_maintenance_date = ${nextMaintenanceDate},
            updated_at = ${now}
          WHERE id = ${params.id}
        `
      }
    } else {
      const {
        clientId,
        equipment,
        serviceTitle,
        description,
        value,
        costs,
        startDate,
        deliveryDate,
        nextMaintenanceDate,
        status,
      } = body

      const costsJson = costs ? JSON.stringify(costs) : "[]"

      let calculatedNextMaintenance = null
      if (deliveryDate) {
        calculatedNextMaintenance = nextMaintenanceDate
          ? new Date(nextMaintenanceDate)
          : calculateNextMaintenanceDate(deliveryDate)
      }

      await sql`
        UPDATE maintenance_orders
        SET 
          client_id = ${clientId},
          equipment = ${equipment || null},
          service_title = ${serviceTitle},
          description = ${description},
          value = ${value},
          costs = ${costsJson}::jsonb,
          start_date = ${startDate ? new Date(startDate) : null},
          delivery_date = ${deliveryDate ? new Date(deliveryDate) : null},
          next_maintenance_date = ${calculatedNextMaintenance},
          status = ${status || "ABERTA"},
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
