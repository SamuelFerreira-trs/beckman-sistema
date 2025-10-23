"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { User, Wrench } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { formatDate, formatCurrency } from "@/lib/utils"

interface SearchResult {
  type: "client" | "maintenance"
  id: string
  title: string
  subtitle: string
  metadata?: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const [clientsRes, maintenancesRes] = await Promise.all([
        fetch(`/api/clients?query=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/maintenance?query=${encodeURIComponent(searchQuery)}`),
      ])

      const clients = await clientsRes.json()
      const maintenances = await maintenancesRes.json()

      const clientResults: SearchResult[] = clients.slice(0, 5).map((client: any) => ({
        type: "client" as const,
        id: client.id,
        title: client.name,
        subtitle: client.phone,
        metadata: client.email,
      }))

      const maintenanceResults: SearchResult[] = maintenances.slice(0, 5).map((maintenance: any) => ({
        type: "maintenance" as const,
        id: maintenance.id,
        title: maintenance.serviceTitle,
        subtitle: maintenance.client?.name || "Cliente desconhecido",
        metadata: `${formatDate(maintenance.openedAt)} • ${formatCurrency(maintenance.value)}`,
      }))

      setResults([...clientResults, ...maintenanceResults])
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")

    if (result.type === "client") {
      router.push(`/dashboard/clientes/${result.id}`)
    } else {
      router.push(`/dashboard/manutencoes`)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar clientes ou manutenções..." value={query} onValueChange={setQuery} />
      <CommandList>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Buscando...</div>
        ) : (
          <>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

            {results.filter((r) => r.type === "client").length > 0 && (
              <CommandGroup heading="Clientes">
                {results
                  .filter((r) => r.type === "client")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.subtitle} {result.metadata && `• ${result.metadata}`}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {results.filter((r) => r.type === "maintenance").length > 0 && (
              <CommandGroup heading="Manutenções">
                {results
                  .filter((r) => r.type === "maintenance")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3"
                    >
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.subtitle} {result.metadata && `• ${result.metadata}`}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
