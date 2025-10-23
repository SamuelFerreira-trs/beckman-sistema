"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientsTable } from "@/components/clients/clients-table"
import { NewClientDialog } from "@/components/clients/new-client-dialog"

export default function ClientesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Clientes</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerencie seus clientes e histórico de manutenções</p>
          </div>
          <NewClientDialog>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo cliente
            </Button>
          </NewClientDialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou e-mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <ClientsTable searchQuery={searchQuery} />
      </div>
    </div>
  )
}
