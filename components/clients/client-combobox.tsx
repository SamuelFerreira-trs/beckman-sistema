"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NewClientDialog } from "@/components/clients/new-client-dialog"

interface Client {
  id: string
  name: string
  phone?: string
  email?: string
}

interface ClientComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  allowCreate?: boolean
}

export function ClientCombobox({
  value,
  onValueChange,
  placeholder = "Buscar cliente...",
  className,
  allowCreate = false,
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchClients() {
      setLoading(true)
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

  const selectedClient = clients.find((client) => client.id === value)

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients

    const searchLower = search.toLowerCase()
    return clients.filter((client) => {
      return (
        client.name?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      )
    })
  }, [clients, search])

  const recentClients = useMemo(() => {
    if (typeof window === "undefined") return []
    const recent = localStorage.getItem("recent-clients")
    if (!recent) return []
    const recentIds = JSON.parse(recent) as string[]
    return clients.filter((c) => recentIds.includes(c.id)).slice(0, 3)
  }, [clients])

  const handleSelect = (clientId: string) => {
    onValueChange(clientId)
    setOpen(false)
    setSearch("")

    // Save to recent clients
    if (typeof window !== "undefined") {
      const recent = localStorage.getItem("recent-clients")
      const recentIds = recent ? (JSON.parse(recent) as string[]) : []
      const updated = [clientId, ...recentIds.filter((id) => id !== clientId)].slice(0, 5)
      localStorage.setItem("recent-clients", JSON.stringify(updated))
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange("")
    setSearch("")
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (selectedClient) {
        handleClear(e as any)
      } else {
        setOpen(false)
      }
    } else if (e.key === "Enter" && !selectedClient) {
      setOpen(true)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayValue = selectedClient
    ? `${selectedClient.name} (${selectedClient.phone || selectedClient.email})`
    : search

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200",
              selectedClient ? "text-primary" : "text-muted-foreground",
            )}
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="client-listbox"
            aria-autocomplete="list"
            aria-label="Buscar cliente"
            value={displayValue}
            onChange={(e) => {
              if (!selectedClient) {
                setSearch(e.target.value)
                setOpen(true)
              }
            }}
            onFocus={() => {
              if (!selectedClient) {
                setOpen(true)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={selectedClient ? "" : placeholder}
            readOnly={!!selectedClient}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background pl-9 pr-10 py-2 text-sm transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              selectedClient
                ? "cursor-pointer border-primary/50 bg-primary/5 font-medium"
                : "border-border hover:border-primary/30",
              className,
            )}
          />
          {selectedClient && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar seleção"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-sm",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-all duration-200 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                "animate-in fade-in zoom-in-95",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 bg-card border-border rounded-lg shadow-lg"
        align="start"
        id="client-listbox"
      >
        <Command className="bg-card">
          <CommandList className="max-h-[320px] py-2">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Carregando clientes...</div>
            ) : (
              <>
                {!search && recentClients.length > 0 && (
                  <CommandGroup
                    heading="Recentes"
                    className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {recentClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id}
                        onSelect={() => handleSelect(client.id)}
                        className="px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors duration-150 hover:bg-[#2E3135] aria-selected:bg-[#2E3135] data-[selected=true]:bg-[#2E3135]"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(client.name)}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate">{client.name}</span>
                            {(client.phone || client.email) && (
                              <span className="text-xs text-[#A1A1AA] truncate">{client.phone || client.email}</span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {filteredClients.length === 0 ? (
                  <CommandEmpty>
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground mb-3">Nenhum cliente encontrado.</p>
                      {allowCreate && (
                        <NewClientDialog>
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Plus className="h-4 w-4" />
                            Criar novo cliente
                          </Button>
                        </NewClientDialog>
                      )}
                    </div>
                  </CommandEmpty>
                ) : (
                  <CommandGroup
                    heading={
                      search
                        ? `${filteredClients.length} resultado${filteredClients.length !== 1 ? "s" : ""}`
                        : "Todos os clientes"
                    }
                    className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:mt-4"
                  >
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id}
                        onSelect={() => handleSelect(client.id)}
                        className="px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors duration-150 hover:bg-[#2E3135] aria-selected:bg-[#2E3135] data-[selected=true]:bg-[#2E3135]"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(client.name)}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate">{client.name}</span>
                            {(client.phone || client.email) && (
                              <span className="text-xs text-[#A1A1AA] truncate">{client.phone || client.email}</span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {allowCreate && filteredClients.length > 0 && (
                  <div className="border-t border-border p-2 mt-2">
                    <NewClientDialog>
                      <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                        <Plus className="h-4 w-4" />
                        Criar novo cliente
                      </Button>
                    </NewClientDialog>
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
