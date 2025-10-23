"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clientSchema, type ClientFormData } from "@/lib/validations"

export function NewClientDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    try {
      const response = await fetch("/api/clients", {
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
      console.error("Error creating client:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Novo cliente</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados do cliente para cadastrá-lo no sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome *
              </Label>
              <Input id="name" {...register("name")} className="bg-background border-border text-foreground" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Telefone *
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(11) 98765-4321"
                className="bg-background border-border text-foreground"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="cliente@email.com"
                className="bg-background border-border text-foreground"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Salvando..." : "Salvar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
