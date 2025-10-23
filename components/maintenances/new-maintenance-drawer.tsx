"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { maintenanceSchema, type MaintenanceFormData } from "@/lib/validations"
import type { Client } from "@/lib/types"

export function NewMaintenanceDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
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
    }
  }, [open])

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true)
    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setOpen(false)
        reset()
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating maintenance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl bg-[#18191b] border-[#272a2d] text-[#eceef0] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-[#eceef0]">Nova manutenção</SheetTitle>
          <SheetDescription className="text-[#5c6166]">
            Preencha os dados da ordem de serviço para registrá-la no sistema.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-[#eceef0]">
              Cliente *
            </Label>
            <Select onValueChange={(value) => setValue("clientId", value)}>
              <SelectTrigger className="bg-[#101112] border-[#272a2d] text-[#eceef0]">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent className="bg-[#18191b] border-[#272a2d]">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-[#eceef0] focus:bg-[#272a2d]">
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-sm text-red-500">{errors.clientId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment" className="text-[#eceef0]">
              Equipamento
            </Label>
            <Input
              id="equipment"
              {...register("equipment")}
              placeholder="Ex: Notebook Dell Inspiron 15"
              className="bg-[#101112] border-[#272a2d] text-[#eceef0]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceTitle" className="text-[#eceef0]">
              Título do serviço *
            </Label>
            <Input
              id="serviceTitle"
              {...register("serviceTitle")}
              placeholder="Ex: Troca de HD por SSD"
              className="bg-[#101112] border-[#272a2d] text-[#eceef0]"
            />
            {errors.serviceTitle && <p className="text-sm text-red-500">{errors.serviceTitle.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#eceef0]">
              Descrição detalhada *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o que foi consertado"
              rows={4}
              className="bg-[#101112] border-[#272a2d] text-[#eceef0]"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-[#eceef0]">
                Valor *
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value", { valueAsNumber: true })}
                placeholder="0.00"
                className="bg-[#101112] border-[#272a2d] text-[#eceef0]"
              />
              {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalCost" className="text-[#eceef0]">
                Custo interno
              </Label>
              <Input
                id="internalCost"
                type="number"
                step="0.01"
                {...register("internalCost", { valueAsNumber: true })}
                placeholder="0.00"
                className="bg-[#101112] border-[#272a2d] text-[#eceef0]"
              />
              <p className="text-xs text-[#5c6166]">Preencha apenas se houver gasto com este serviço.</p>
              {errors.internalCost && <p className="text-sm text-red-500">{errors.internalCost.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-[#272a2d] text-[#eceef0] hover:bg-[#272a2d]"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#d3d655] text-[#101112] hover:bg-[#5a5c27]">
              {loading ? "Criando..." : "Criar ordem"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
