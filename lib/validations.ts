import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  phone: z.string().min(1, "Campo obrigatório."),
  email: z.string().email("Informe um e-mail válido.").optional().or(z.literal("")),
})

export const internalCostSchema = z.object({
  name: z.string().min(1, "Nome do custo é obrigatório."),
  value: z.number().positive("Valor deve ser maior que zero."),
})

export const maintenanceSchema = z.object({
  clientId: z.string().min(1, "Campo obrigatório."),
  equipment: z.string().optional(),
  serviceTitle: z.string().min(1, "Campo obrigatório."),
  description: z.string().min(1, "Campo obrigatório."),
  value: z.number().positive("Valor deve ser maior que zero."),
  costs: z.array(internalCostSchema).default([]),
  startDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  status: z.enum(["ABERTA", "CONCLUIDA", "CANCELADA"]).optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>
