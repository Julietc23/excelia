"use client"
import { useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"

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
import { Check, Lock, Mail, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function LoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Función simplificada para verificar la conexión y mostrar datos de la tabla
  const checkTableData = async () => {
    try {
      const { data, error } = await supabase.from("data_users").select("*")

      if (error) {
        console.error("Error al consultar la tabla:", error)
        setDebugInfo({ success: false, error })
        return
      }

      console.log("Datos de la tabla data_users:", data)
      setDebugInfo({ success: true, data })
    } catch (err) {
      console.error("Error inesperado:", err)
      setDebugInfo({ success: false, error: err })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Consulta directa y simple para depuración
      const { data: allUsers, error: allUsersError } = await supabase.from("data_users").select("*")

      if (allUsersError) {
        console.error("Error al consultar todos los usuarios:", allUsersError)
        setError(`Error al acceder a la base de datos: ${allUsersError.message}`)
        setIsLoading(false)
        return
      }

      console.log("Todos los usuarios en la tabla:", allUsers)

      // Buscar el usuario específico
      // IMPORTANTE: Usamos .ilike para hacer una búsqueda insensible a mayúsculas/minúsculas
      const { data, error: queryError } = await supabase.from("data_users").select("*").ilike("user", email)

      if (queryError) {
        console.error("Error en la consulta de usuario:", queryError)
        setError(`Error al verificar credenciales: ${queryError.message}`)
        setIsLoading(false)
        return
      }

      console.log("Usuarios encontrados con ese email:", data)

      // Verificar si se encontraron resultados
      if (!data || data.length === 0) {
        console.log("No se encontró ningún usuario con ese email")
        setError("Usuario no encontrado. Por favor, verifica tus credenciales.")
        setIsLoading(false)
        return
      }

      // Verificar la contraseña manualmente
      const userFound = data.find((user) => user.password === password)

      if (!userFound) {
        console.log("Contraseña incorrecta")
        setError("Contraseña incorrecta. Por favor, inténtalo de nuevo.")
        setIsLoading(false)
        return
      }

      // Si llegamos aquí, las credenciales son correctas
      console.log("Inicio de sesión exitoso:", userFound)

      localStorage.setItem("userEmail", email)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userData", JSON.stringify(userFound))

      setIsLoading(false)
      setSubmitted(true)

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
        variant: "default",
      })

      // Redirigir al dashboard después de mostrar el mensaje de éxito
      setTimeout(() => {
        setSubmitted(false)
        onOpenChange(false)
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      console.error("Error de autenticación:", err)
      setError(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-xl bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Iniciar sesión</DialogTitle>
          <DialogDescription>Accede a tu cuenta para gestionar tus integraciones de IA con Excel.</DialogDescription>
        </DialogHeader>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="rounded-xl pl-10 h-11 border-muted-foreground/20 focus-visible:ring-blue-500"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Button variant="link" className="h-auto p-0 text-xs text-blue-500">
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl pl-10 h-11 border-muted-foreground/20 focus-visible:ring-blue-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="submit"
                className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </DialogFooter>

            {/* Información de depuración y ayuda */}
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">¿No tienes una cuenta? </span>
              <Button variant="link" className="p-0 text-blue-500">
                Regístrate ahora
              </Button>
            </div>

            <div className="mt-2 text-center">
              <Button variant="outline" size="sm" className="text-xs" onClick={checkTableData}>
                Verificar conexión
              </Button>

              {debugInfo && (
                <div className="mt-2 text-xs text-left bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-auto max-h-40">
                  <p className="font-semibold mb-1">{debugInfo.success ? "Conexión exitosa" : "Error de conexión"}:</p>
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}

              <div className="mt-2 text-xs text-muted-foreground">
                <p>Estructura de la tabla: data_users (id, user, password)</p>
                <p>Asegúrate de usar el email exacto registrado en la columna "user"</p>
              </div>
            </div>
          </form>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-8 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h3 className="text-xl font-semibold">¡Inicio de sesión exitoso!</h3>
            <p className="text-muted-foreground">Redirigiendo a tu dashboard...</p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
