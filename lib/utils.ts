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
