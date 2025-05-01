// Componente para cargar archivos Excel
"use client"

import type React from "react"

import { useState } from "react"
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
import { FileSpreadsheet, Upload, Check, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

/**
 * Propiedades para el componente UploadDialog
 */
interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

/**
 * Componente UploadDialog
 *
 * Proporciona una interfaz para cargar archivos Excel.
 * Muestra un formulario de carga y una animación de éxito.
 *
 * @param open - Estado de apertura del diálogo
 * @param onOpenChange - Función para cambiar el estado de apertura
 */
export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  // Estado para el archivo seleccionado
  const [file, setFile] = useState<File | null>(null)
  // Estado para indicar si se está cargando el archivo
  const [isUploading, setIsUploading] = useState(false)
  // Estado para indicar si la carga se ha completado
  const [isComplete, setIsComplete] = useState(false)
  // Estado para errores
  const [error, setError] = useState<string | null>(null)
  // Estado para detalles del error (para depuración)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  /**
   * Maneja el cambio de archivo seleccionado
   *
   * @param e - Evento de cambio del input de archivo
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setErrorDetails(null)
    }
  }

  /**
   * Maneja el envío del formulario para cargar el archivo
   *
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setError(null)
    setErrorDetails(null)

    try {
      // Verificar que el archivo sea Excel o CSV
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
        throw new Error("El archivo debe ser Excel (.xlsx o .xls) o CSV (.csv)")
      }

      // Crear un objeto FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      console.log("Enviando archivo al backend:", file.name)
      console.log("URL de la API:", `${API_BASE_URL}/upload/`)

      // Enviar el archivo al backend
      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: "POST",
        body: formData,
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error del servidor:", errorText)
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorText}`)
      }

      // Procesar la respuesta
      const data = await response.json()
      console.log("Archivo cargado exitosamente:", data)

      // Mostrar mensaje de éxito
      setIsUploading(false)
      setIsComplete(true)

      // Mostrar toast de éxito
      toast({
        title: "Archivo cargado",
        description: "El archivo se ha cargado correctamente.",
        variant: "default",
      })

      // Cerrar el diálogo después de mostrar el éxito
      setTimeout(() => {
        setIsComplete(false)
        setFile(null)
        onOpenChange(false)

        // Recargar la página para actualizar la lista de archivos
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error al cargar el archivo:", error)
      setIsUploading(false)

      // Mostrar mensaje de error
      setError("Error al cargar el archivo. Por favor, intenta de nuevo.")
      setErrorDetails(error instanceof Error ? error.message : String(error))

      // Mostrar toast de error
      toast({
        title: "Error",
        description: "No se pudo cargar el archivo. Verifica la consola para más detalles.",
        variant: "destructive",
      })
    }
  }

  // Función para probar la conexión con el backend
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace("/api", "")}`, {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Conexión exitosa",
          description: `Respuesta del backend: ${JSON.stringify(data)}`,
          variant: "default",
        })
      } else {
        toast({
          title: "Error de conexión",
          description: `El backend respondió con: ${response.status} ${response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con el backend: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Cargar archivo Excel</DialogTitle>
          <DialogDescription>Sube un archivo Excel o CSV para analizarlo con IA</DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col gap-2 text-red-800 dark:text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                  {errorDetails && (
                    <div className="text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-auto max-h-24">
                      {errorDetails}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file">Archivo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="flex-1"
                    disabled={isUploading}
                  />
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" size="sm" onClick={testBackendConnection} className="sm:mr-auto">
                Probar conexión
              </Button>
              <Button
                type="submit"
                className="rounded-md bg-blue-500 hover:bg-blue-600"
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
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
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir archivo
                  </>
                )}
              </Button>
            </DialogFooter>
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
            <h3 className="text-xl font-semibold">¡Archivo subido!</h3>
            <p className="text-muted-foreground">Tu archivo ha sido cargado y está siendo procesado.</p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
