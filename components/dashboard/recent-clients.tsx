"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Client } from "@/lib/types"

export function RecentClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/dashboard/recent-clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching recent clients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Carregando clientes...</div>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Clientes Recentes</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-secondary">
          <Link href="/dashboard/clientes">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clientes/${client.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="font-medium text-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(client.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
