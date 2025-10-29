import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined, locale = "pt-BR"): string {
  if (!date) return "-"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "-"
    }

    return dateObj.toLocaleDateString(locale)
  } catch (error) {
    console.error("[v0] Error formatting date:", error)
    return "-"
  }
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "-"

  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  if (isNaN(numValue)) return "-"

  return numValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function calculateTotalCosts(costs: Array<{ name: string; value: number }>): number {
  if (!costs || costs.length === 0) return 0
  return costs.reduce((total, cost) => total + (cost.value || 0), 0)
}

export function calculateNextMaintenanceDate(deliveryDate: string | Date): Date {
  const delivery = typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate
  const nextMaintenance = new Date(delivery)
  nextMaintenance.setMonth(nextMaintenance.getMonth() + 4)
  return nextMaintenance
}
