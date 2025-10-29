"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClientCombobox } from "@/components/clients/client-combobox"
import { maintenanceSchema, type MaintenanceFormData } from "@/lib/validations"
import { calculateTotalCosts } from "@/lib/utils"

export function NewMaintenanceDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      costs: [],
      startDate: new Date().toISOString().split("T")[0],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "costs",
  })

  const costs = watch("costs")
  const deliveryDate = watch("deliveryDate")

  useEffect(() => {
    if (deliveryDate) {
      const delivery = new Date(deliveryDate)
      const nextMaintenance = new Date(delivery)
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 4)
      setValue("nextMaintenanceDate", nextMaintenance.toISOString().split("T")[0])
    }
  }, [deliveryDate, setValue])

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
      <SheetContent className="w-full sm:max-w-xl bg-card border-border text-foreground overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">Nova manutenção</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Preencha os dados da ordem de serviço para registrá-la no sistema.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-0">
          {/* Basic Info Section */}
          <div className="space-y-4 px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Informações Básicas</h3>

            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-foreground">
                Cliente *
              </Label>
              <ClientCombobox
                onValueChange={(value) => setValue("clientId", value)}
                placeholder="Buscar cliente..."
                allowCreate={true}
              />
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
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground">Custos Internos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", value: 0 })}
                className="h-8 border-border text-foreground hover:bg-secondary"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar custo
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum custo interno adicionado.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        {...register(`costs.${index}.name`)}
                        placeholder="Nome do custo"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`costs.${index}.value`, { valueAsNumber: true })}
                        placeholder="0.00"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-10 w-10 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground">
                    Total: R$ {calculateTotalCosts(costs || []).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Datas</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-foreground">
                  Data de início
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate" className="text-foreground">
                  Data de entrega
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  {...register("deliveryDate")}
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">Obrigatório ao concluir</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextMaintenanceDate" className="text-foreground">
                Próxima manutenção
              </Label>
              <Input
                id="nextMaintenanceDate"
                type="date"
                {...register("nextMaintenanceDate")}
                className="bg-background border-primary/50 text-foreground"
              />
              <p className="text-xs text-primary">Auto-calculado (+4 meses da entrega), mas pode ser editado</p>
            </div>
          </div>

          <div className="flex gap-3 px-4 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
            >
              {loading ? "Criando..." : "Criar ordem"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
