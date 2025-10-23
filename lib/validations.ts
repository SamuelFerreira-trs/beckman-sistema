import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  phone: z.string().min(1, "Campo obrigatório."),
  email: z.string().email("Informe um e-mail válido.").optional().or(z.literal("")),
})

export const maintenanceSchema = z.object({
  clientId: z.string().min(1, "Campo obrigatório."),
  equipment: z.string().optional(),
  serviceTitle: z.string().min(1, "Campo obrigatório."),
  description: z.string().min(1, "Campo obrigatório."),
  value: z.number().positive("Valor deve ser maior que zero."),
  internalCost: z.number().nonnegative("Custo não pode ser negativo.").optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>
