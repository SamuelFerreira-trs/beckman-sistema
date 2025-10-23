"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import type { Client } from "@/lib/types"

interface ClientsTableProps {
  searchQuery?: string
}

export function ClientsTable({ searchQuery = "" }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query),
    )
    setFilteredClients(filtered)
  }, [clients, searchQuery])

  if (loading) {
    return <div className="text-muted-foreground">Carregando clientes...</div>
  }

  if (filteredClients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg text-foreground">
          {clients.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {clients.length === 0 ? "Crie o primeiro para começar!" : "Tente buscar por outro termo."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-secondary/50">
            <TableHead className="text-muted-foreground">Nome</TableHead>
            <TableHead className="text-muted-foreground">Telefone</TableHead>
            <TableHead className="text-muted-foreground">E-mail</TableHead>
            <TableHead className="text-muted-foreground">Cadastrado em</TableHead>
            <TableHead className="text-right text-muted-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow key={client.id} className="border-border hover:bg-secondary/30">
              <TableCell className="font-medium text-foreground">{client.name}</TableCell>
              <TableCell className="text-foreground">{client.phone}</TableCell>
              <TableCell className="text-foreground">{client.email || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(client.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:bg-secondary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem asChild className="text-foreground focus:bg-secondary focus:text-foreground">
                      <Link href={`/dashboard/clientes/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
