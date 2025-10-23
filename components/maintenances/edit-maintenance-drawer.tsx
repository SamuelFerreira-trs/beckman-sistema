"use client"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { maintenanceSchema, type MaintenanceFormData } from "@/lib/validations"
import type { Client, MaintenanceOS } from "@/lib/types"

interface EditMaintenanceDrawerProps {
  maintenance: MaintenanceOS & { client: { id: string; name: string } }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditMaintenanceDrawer({ maintenance, open, onOpenChange, onSuccess }: EditMaintenanceDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      clientId: maintenance.clientId,
      equipment: maintenance.equipment || "",
      serviceTitle: maintenance.serviceTitle,
      description: maintenance.description,
      value: Number(maintenance.value),
      internalCost: maintenance.internalCost ? Number(maintenance.internalCost) : undefined,
    },
  })

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }

    if (open) {
      fetchClients()
      // Reset form with current maintenance data
      reset({
        clientId: maintenance.clientId,
        equipment: maintenance.equipment || "",
        serviceTitle: maintenance.serviceTitle,
        description: maintenance.description,
        value: Number(maintenance.value),
        internalCost: maintenance.internalCost ? Number(maintenance.internalCost) : undefined,
      })
    }
  }, [open, maintenance, reset])

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/maintenance/${maintenance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        onOpenChange(false)
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating maintenance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl bg-card border-border text-foreground overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">Editar manutenção</SheetTitle>
          <SheetDescription className="text-muted-foreground">Atualize os dados da ordem de serviço.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-foreground">
              Cliente *
            </Label>
            <Select defaultValue={maintenance.clientId} onValueChange={(value) => setValue("clientId", value)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-foreground focus:bg-secondary">
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment" className="text-foreground">
              Equipamento
            </Label>
            <Input
              id="equipment"
              {...register("equipment")}
              placeholder="Ex: Notebook Dell Inspiron 15"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceTitle" className="text-foreground">
              Título do serviço *
            </Label>
            <Input
              id="serviceTitle"
              {...register("serviceTitle")}
              placeholder="Ex: Troca de HD por SSD"
              className="bg-background border-border text-foreground"
            />
            {errors.serviceTitle && <p className="text-sm text-destructive">{errors.serviceTitle.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Descrição detalhada *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o que foi consertado"
              rows={4}
              className="bg-background border-border text-foreground"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-foreground">
                Valor *
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value", { valueAsNumber: true })}
                placeholder="0.00"
                className="bg-background border-border text-foreground"
              />
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalCost" className="text-foreground">
                Custo interno
              </Label>
              <Input
                id="internalCost"
                type="number"
                step="0.01"
                {...register("internalCost", { valueAsNumber: true })}
                placeholder="0.00"
                className="bg-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">Preencha apenas se houver gasto com este serviço.</p>
              {errors.internalCost && <p className="text-sm text-destructive">{errors.internalCost.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
