export interface Client {
  id: string
  name: string
  phone: string
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export interface InternalCost {
  name: string
  value: number
}

export interface MaintenanceOS {
  id: string
  clientId: string
  equipment: string | null
  serviceTitle: string
  description: string
  value: number
  internalCost: number | null // Deprecated
  costs: InternalCost[]
  status: "ABERTA" | "CONCLUIDA" | "CANCELADA"
  startDate: Date
  deliveryDate: Date | null
  nextMaintenanceDate: Date | null
  openedAt: Date
  closedAt: Date | null
  nextReminderAt: Date | null
  nextReminderStep: "M4" | "M6" | null
  createdAt: Date
  updatedAt: Date
}

export interface ClientWithMaintenances extends Client {
  maintenances: MaintenanceOS[]
}

export interface MonthlySummary {
  totalRevenue: number
  totalCosts: number
  netGain: number
  orderCount: number
}
