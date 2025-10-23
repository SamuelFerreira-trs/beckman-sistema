export interface Client {
  id: string
  name: string
  phone: string
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceOS {
  id: string
  clientId: string
  equipment: string | null
  serviceTitle: string
  description: string
  value: number
  internalCost: number | null
  status: "ABERTA" | "CONCLUIDA" | "CANCELADA"
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
