import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { nextStep } = body
    const now = new Date()

    if (nextStep === "M6") {
      const nextReminderAt = new Date(now)
      nextReminderAt.setMonth(nextReminderAt.getMonth() + 2)

      await sql`
        UPDATE maintenance_orders
        SET next_reminder_at = ${nextReminderAt}, next_reminder_step = 'M6', updated_at = ${now}
        WHERE id = ${params.id}
      `
    } else {
      await sql`
        UPDATE maintenance_orders
        SET next_reminder_at = NULL, next_reminder_step = NULL, updated_at = ${now}
        WHERE id = ${params.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({ error: "Erro ao atualizar lembrete" }, { status: 500 })
  }
}
