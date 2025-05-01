"use client"
import { useState } from "react"
import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

export function DemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Solicitar Demo</DialogTitle>
          <DialogDescription>
            Completa el formulario para programar una demostración personalizada de nuestra solución.
          </DialogDescription>
        </DialogHeader>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" placeholder="Nombre de tu empresa" className="rounded-xl" required />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl bg-blue-500 hover:bg-blue-600">
                Enviar solicitud
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">¡Solicitud enviada!</h3>
            <p className="text-muted-foreground">Te contactaremos pronto para coordinar la demo.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
