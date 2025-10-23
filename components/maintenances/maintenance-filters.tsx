"use client"

import { useState, useEffect } from "react"
import { Filter, X, Save, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface FilterValues {
  query: string
  status: string
  clientId: string
  dateFrom: string
  dateTo: string
  minValue: string
  maxValue: string
}

interface SavedFilter {
  id: string
  name: string
  filters: FilterValues
}

interface MaintenanceFiltersProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  clients: Array<{ id: string; name: string }>
}

export function MaintenanceFilters({ filters, onFiltersChange, clients }: MaintenanceFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [filterName, setFilterName] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("maintenance-filters")
    if (saved) {
      setSavedFilters(JSON.parse(saved))
    }
  }, [])

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== "all")

  const handleClearFilters = () => {
    onFiltersChange({
      query: "",
      status: "all",
      clientId: "",
      dateFrom: "",
      dateTo: "",
      minValue: "",
      maxValue: "",
    })
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: { ...filters },
    }

    const updated = [...savedFilters, newFilter]
    setSavedFilters(updated)
    localStorage.setItem("maintenance-filters", JSON.stringify(updated))
    setFilterName("")
  }

  const handleApplyFilter = (filter: SavedFilter) => {
    onFiltersChange(filter.filters)
  }

  const handleDeleteFilter = (id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id)
    setSavedFilters(updated)
    localStorage.setItem("maintenance-filters", JSON.stringify(updated))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {/* Search Query */}
        <div className="flex-1">
          <Input
            placeholder="Buscar por serviço, equipamento ou descrição..."
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            className="bg-card border-border"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ABERTA">Abertas</SelectItem>
            <SelectItem value="CONCLUIDA">Concluídas</SelectItem>
            <SelectItem value="CANCELADA">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        {/* Client Filter */}
        <Select value={filters.clientId} onValueChange={(value) => onFiltersChange({ ...filters, clientId: value })}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Todos os clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Mais filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Filtros Avançados</h4>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Período</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                    className="bg-background border-border"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              {/* Value Range */}
              <div className="space-y-2">
                <Label>Faixa de valor</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.minValue}
                    onChange={(e) => onFiltersChange({ ...filters, minValue: e.target.value })}
                    className="bg-background border-border"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxValue}
                    onChange={(e) => onFiltersChange({ ...filters, maxValue: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              {/* Save Filter */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Salvar filtro atual</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do filtro"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Button onClick={handleSaveFilter} size="sm" disabled={!filterName.trim()}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Star className="h-4 w-4" />
                Salvos
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              {savedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center">
                  <DropdownMenuItem
                    onClick={() => handleApplyFilter(filter)}
                    className="flex-1 text-foreground focus:bg-secondary"
                  >
                    {filter.name}
                  </DropdownMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFilter(filter.id)
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
