"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteMaintenanceDialogProps {
  maintenanceId: string
  maintenanceTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteMaintenanceDialog({
  maintenanceId,
  maintenanceTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMaintenanceDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/maintenance/${maintenanceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onOpenChange(false)
        onSuccess()
      }
    } catch (error) {
      console.error("Error deleting maintenance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Excluir manutenção</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Tem certeza que deseja excluir a manutenção{" "}
            <span className="font-semibold text-foreground">"{maintenanceTitle}"</span>? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-foreground hover:bg-secondary">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
