"use client"

import { useEffect, useState } from "react"
import { Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { MaintenanceOS } from "@/lib/types"

interface MaintenanceWithClient extends MaintenanceOS {
  client: {
    name: string
  }
}

export function UpcomingReminders() {
  const [reminders, setReminders] = useState<MaintenanceWithClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReminders() {
      try {
        const response = await fetch("/api/dashboard/upcoming-reminders")
        const data = await response.json()
        setReminders(data)
      } catch (error) {
        console.error("Error fetching reminders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Carregando lembretes...</div>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Lembretes Próximos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lembrete pendente.</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const reminderDate = reminder.nextReminderAt ? new Date(reminder.nextReminderAt) : null
              const daysUntil = reminderDate
                ? Math.ceil((reminderDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 0
              const isOverdue = daysUntil < 0

              return (
                <div
                  key={reminder.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    isOverdue ? "border-destructive/50 bg-destructive/10" : "border-border"
                  }`}
                >
                  {isOverdue && <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{reminder.client.name}</p>
                    <p className="text-sm text-muted-foreground">{reminder.serviceTitle}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{formatDate(reminder.nextReminderAt)}</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary">
                        {reminder.nextReminderStep}
                      </span>
                      {isOverdue ? (
                        <span className="text-destructive font-medium">Atrasado</span>
                      ) : (
                        <span className="text-muted-foreground">em {daysUntil} dias</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
