"use client"

import { SheetTrigger } from "@/components/ui/sheet"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, X, AlertCircle } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClientCombobox } from "@/components/clients/client-combobox"
import { maintenanceSchema, type MaintenanceFormData } from "@/lib/validations"
import { calculateTotalCosts } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { MaintenanceOS } from "@/lib/types"

interface MaintenanceFormDrawerProps {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: MaintenanceOS & { client: { id: string; name: string } }
  onSuccess?: () => void
  children?: React.ReactNode
}

const safeDateToInput = (date: Date | string | null | undefined): string => {
  if (!date) return ""
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""
    return dateObj.toISOString().split("T")[0]
  } catch {
    return ""
  }
}

export function MaintenanceFormDrawer({
  mode,
  open,
  onOpenChange,
  initialData,
  onSuccess,
  children,
}: MaintenanceFormDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
    control,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      costs: [],
      startDate: new Date().toISOString().split("T")[0],
      status: "ABERTA",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "costs",
  })

  const costs = watch("costs")
  const deliveryDate = watch("deliveryDate")
  const status = watch("status")
  const value = watch("value")

  const profitMargin = useMemo(() => {
    const totalCosts = calculateTotalCosts(costs || [])
    const revenue = Number(value) || 0
    return revenue > 0 ? ((revenue - totalCosts) / revenue) * 100 : 0
  }, [costs, value])

  useEffect(() => {
    if (deliveryDate) {
      const delivery = new Date(deliveryDate)
      const nextMaintenance = new Date(delivery)
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 4)
      setValue("nextMaintenanceDate", nextMaintenance.toISOString().split("T")[0])
    }
  }, [deliveryDate, setValue])

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        reset({
          clientId: initialData.clientId,
          equipment: initialData.equipment || "",
          serviceTitle: initialData.serviceTitle || "",
          description: initialData.description,
          value: Number(initialData.value),
          costs: initialData.costs || [],
          startDate: safeDateToInput(initialData.startDate),
          deliveryDate: safeDateToInput(initialData.deliveryDate),
          nextMaintenanceDate: safeDateToInput(initialData.nextMaintenanceDate),
          status: initialData.status,
        })
      } else if (mode === "create") {
        reset({
          clientId: "",
          equipment: "",
          serviceTitle: "",
          description: "",
          value: 0,
          costs: [],
          startDate: new Date().toISOString().split("T")[0],
          deliveryDate: "",
          nextMaintenanceDate: "",
          status: "ABERTA",
        })
      }
      setError(null)
    }
  }, [open, mode, initialData, reset])

  const onSubmit = useCallback(
    async (data: MaintenanceFormData) => {
      if (data.status === "CONCLUIDA" && !data.deliveryDate) {
        setError("Data de entrega é obrigatória para manutenções concluídas.")
        return
      }

      setLoading(true)
      setError(null)
      try {
        const url = mode === "create" ? "/api/maintenance" : `/api/maintenance/${initialData?.id}`
        const method = mode === "create" ? "POST" : "PATCH"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao salvar manutenção")
        }

        onOpenChange(false)
        if (mode === "create") {
          router.refresh()
        } else if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro ao salvar manutenção")
      } finally {
        setLoading(false)
      }
    },
    [mode, initialData, onOpenChange, router, onSuccess],
  )

  const getFieldError = (fieldName: keyof MaintenanceFormData) => {
    const error = errors[fieldName]
    return error ? String(error.message) : null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-xl bg-card border-border text-foreground overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">
            {mode === "create" ? "Nova manutenção" : "Editar manutenção"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {mode === "create"
              ? "Preencha os dados da ordem de serviço para registrá-la no sistema."
              : "Atualize os dados da ordem de serviço."}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-0">
          {/* Basic Info Section */}
          <div className="space-y-4 px-4 py-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Informações Básicas</h3>

            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-foreground">
                Cliente *
              </Label>
              <ClientCombobox
                value={watch("clientId")}
                onValueChange={(value) => setValue("clientId", value, { shouldDirty: true })}
                placeholder="Buscar cliente..."
                allowCreate={true}
              />
              {getFieldError("clientId") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("clientId")}
                </p>
              )}
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
              {getFieldError("serviceTitle") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("serviceTitle")}
                </p>
              )}
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
                className="bg-background border-border text-foreground resize-none"
              />
              {getFieldError("description") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("description")}
                </p>
              )}
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
              {getFieldError("value") && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("value")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">
                Status
              </Label>
              <Select
                value={status || "ABERTA"}
                onValueChange={(value) => setValue("status", value as any, { shouldDirty: true })}
              >
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABERTA">Aberta</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Internal Costs Section */}
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
                      aria-label="Remover custo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Total: R$ {calculateTotalCosts(costs || []).toFixed(2)}
                    </p>
                    {profitMargin > 0 && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          profitMargin >= 50
                            ? "bg-green-500/20 text-green-500"
                            : profitMargin >= 30
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {profitMargin.toFixed(1)}% margem
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates Section */}
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

          {/* Action Buttons */}
          <div className="flex gap-3 px-4 py-4 sticky bottom-0 bg-card border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (mode === "edit" && !isDirty)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent disabled:opacity-50"
            >
              {loading
                ? mode === "create"
                  ? "Criando..."
                  : "Salvando..."
                : mode === "create"
                  ? "Criar ordem"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
