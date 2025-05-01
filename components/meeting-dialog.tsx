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
import { Calendar, Check, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MeetingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-none shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Agendar reunión</DialogTitle>
          <DialogDescription>
            Selecciona una fecha y hora para conversar con nuestro equipo sobre cómo podemos ayudarte.
          </DialogDescription>
        </DialogHeader>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" placeholder="Tu nombre" className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de contacto</Label>
              <Input id="email" type="email" placeholder="tu@email.com" className="rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha preferida</Label>
                <div className="relative">
                  <Input id="date" type="date" className="rounded-xl pl-10" required />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <div className="relative">
                  <Select required>
                    <SelectTrigger className="rounded-xl pl-10">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Tema a tratar</Label>
              <Input id="topic" placeholder="¿Qué te gustaría discutir?" className="rounded-xl" required />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl bg-blue-500 hover:bg-blue-600">
                Confirmar reunión
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">¡Reunión agendada!</h3>
            <p className="text-muted-foreground">Recibirás un correo de confirmación con los detalles.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
