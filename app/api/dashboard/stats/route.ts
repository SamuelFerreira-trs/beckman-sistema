import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Total clients
    const clientsResult = await sql`SELECT COUNT(*) as count FROM clients`
    const totalClients = Number(clientsResult[0].count)

    // Monthly maintenances
    const maintenancesResult = await sql`
      SELECT COUNT(*) as count 
      FROM maintenance_orders 
      WHERE opened_at >= ${startOfMonth} AND opened_at <= ${endOfMonth}
    `
    const totalMaintenances = Number(maintenancesResult[0].count)

    // Monthly revenue
    const revenueResult = await sql`
      SELECT COALESCE(SUM(value), 0) as revenue 
      FROM maintenance_orders 
      WHERE opened_at >= ${startOfMonth} AND opened_at <= ${endOfMonth}
      AND status = 'CONCLUIDA'
    `
    const monthlyRevenue = Number(revenueResult[0].revenue)

    // Upcoming reminders
    const remindersResult = await sql`
      SELECT COUNT(*) as count 
      FROM maintenance_orders 
      WHERE next_reminder_at IS NOT NULL
    `
    const upcomingReminders = Number(remindersResult[0].count)

    return NextResponse.json({
      totalClients,
      totalMaintenances,
      monthlyRevenue,
      upcomingReminders,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
