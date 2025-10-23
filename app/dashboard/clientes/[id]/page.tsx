import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { ClientDetailView } from "@/components/clients/client-detail-view"
import type { Client, MaintenanceOS } from "@/lib/types"

async function getClient(id: string) {
  const result = await sql`
    SELECT * FROM clients WHERE id = ${id}
  `
  return result[0] as Client | undefined
}

async function getClientMaintenances(clientId: string) {
  const result = await sql`
    SELECT * FROM maintenance_orders 
    WHERE client_id = ${clientId}
    ORDER BY opened_at DESC
  `
  return result as MaintenanceOS[]
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const client = await getClient(params.id)

  if (!client) {
    notFound()
  }

  const maintenances = await getClientMaintenances(params.id)

  return <ClientDetailView client={client} maintenances={maintenances} />
}
