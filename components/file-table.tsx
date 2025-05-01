"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Eye, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
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

// Datos de ejemplo para usar cuando el backend no está disponible
const FALLBACK_FILES = [
  {
    id: "example-file-1",
    name: "Ventas_2023_Q1.xlsx",
    size: "1.2 MB",
    uploadedAt: new Date(2023, 0, 15),
    status: "processed",
  },
  {
    id: "example-file-2",
    name: "Inventario_Actualizado.xlsx",
    size: "3.5 MB",
    uploadedAt: new Date(2023, 1, 22),
    status: "processed",
  },
]

// Definir la interfaz para los archivos
interface FileInfo {
  id: string
  name: string
  size: string
  uploadedAt: Date
  status: "processed" | "processing"
}

/**
 * Propiedades para el componente FileTable
 */
interface FileTableProps {
  onFileSelect: (fileId: string) => void
  selectedFileId: string | null
}

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

/**
 * Componente FileTable
 *
 * Muestra una tabla con los archivos Excel cargados por el usuario.
 * Permite seleccionar, descargar y eliminar archivos.
 *
 * @param onFileSelect - Función que se llama cuando se selecciona un archivo
 * @param selectedFileId - ID del archivo actualmente seleccionado
 */
export function FileTable({ onFileSelect, selectedFileId }: FileTableProps) {
  // Estado para la lista de archivos
  const [files, setFiles] = useState<FileInfo[]>([])
  // Estado para el archivo que se va a eliminar
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null)
  // Estado para indicar carga
  const [isLoading, setIsLoading] = useState(true)
  // Estado para indicar si se está usando datos de respaldo
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  // Estado para errores
  const [error, setError] = useState<string | null>(null)
  // Estado para detalles del error (para depuración)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  // Función para cargar la lista de archivos desde el backend
  const fetchFiles = async () => {
    setIsLoading(true)
    setError(null)
    setErrorDetails(null)

    try {
      console.log("Obteniendo lista de archivos desde:", `${API_BASE_URL}/files/`)

      const response = await fetch(`${API_BASE_URL}/files/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error del servidor:", errorText)
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const fileNames = await response.json()
      console.log("Archivos recibidos:", fileNames)

      // Transformar los nombres de archivo en objetos FileInfo
      const fileInfos: FileInfo[] = fileNames.map((fileName: string, index: number) => {
        // Extraer el nombre original del archivo (después del guion bajo)
        const originalName = fileName.includes("_") ? fileName.substring(fileName.indexOf("_") + 1) : fileName

        return {
          id: fileName, // Usar el nombre completo como ID
          name: originalName,
          size: "Desconocido", // El backend no proporciona esta información
          uploadedAt: new Date(), // Usar la fecha actual como aproximación
          status: "processed", // Asumir que todos los archivos están procesados
        }
      })

      setFiles(fileInfos)
      setUsingFallbackData(false)
    } catch (error) {
      console.error("Error al cargar archivos:", error)

      // Usar datos de respaldo
      setFiles(FALLBACK_FILES)
      setUsingFallbackData(true)

      // Establecer mensaje de error
      setError("No se pudo conectar con el servidor. Mostrando datos de ejemplo.")
      setErrorDetails(error instanceof Error ? error.message : String(error))

      // Mostrar un mensaje de error al usuario
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Mostrando datos de ejemplo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar archivos al montar el componente
  useEffect(() => {
    fetchFiles()
  }, [])

  // Modificar la función handleDeleteFile para eliminar archivos del backend
  const handleDeleteFile = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName })
  }

  // Modificar confirmDelete para eliminar el archivo del backend
  const confirmDelete = async () => {
    if (!fileToDelete) return

    try {
      if (!usingFallbackData) {
        console.log("Eliminando archivo:", fileToDelete.id)

        const response = await fetch(`${API_BASE_URL}/files/${fileToDelete.id}`, {
          method: "DELETE",
        })

        console.log("Respuesta del servidor:", response.status, response.statusText)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error del servidor:", errorText)
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorText}`)
        }
      }

      // Eliminar el archivo de la lista local
      setFiles(files.filter((file) => file.id !== fileToDelete.id))

      // Si el archivo eliminado estaba seleccionado, deseleccionarlo
      if (selectedFileId === fileToDelete.id) {
        onFileSelect("")
      }

      // Mostrar notificación de éxito
      toast({
        title: "Archivo eliminado",
        description: `${fileToDelete.name} ha sido eliminado correctamente.`,
        variant: "default",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error al eliminar el archivo:", error)

      if (usingFallbackData) {
        // Si estamos usando datos de respaldo, simular eliminación exitosa
        setFiles(files.filter((file) => file.id !== fileToDelete.id))

        if (selectedFileId === fileToDelete.id) {
          onFileSelect("")
        }

        toast({
          title: "Archivo eliminado",
          description: `${fileToDelete.name} ha sido eliminado correctamente (modo simulación).`,
          variant: "default",
          duration: 3000,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el archivo. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      }
    }

    // Cerrar el diálogo
    setFileToDelete(null)
  }

  /**
   * Formatea una fecha en formato legible
   *
   * @param date - Fecha a formatear
   * @returns Fecha formateada en formato local
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando archivos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-slate-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Tus archivos de datos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un archivo Excel o CSV para analizarlo con IA
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFiles} className="rounded-full" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="mx-6 my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex flex-col gap-2 text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
            {errorDetails && (
              <div className="text-xs bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded overflow-auto max-h-24">
                {errorDetails}
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/80 dark:bg-blue-950/50">
                <TableHead className="w-[300px]">Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha de carga</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="text-muted-foreground">No hay archivos disponibles</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Haz clic en "Cargar archivo Excel o CSV" para comenzar
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow
                    key={file.id}
                    className={
                      selectedFileId === file.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                        <span>{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={file.status === "processed" ? "outline" : "secondary"}
                        className={
                          file.status === "processed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : ""
                        }
                      >
                        {file.status === "processed" ? "Procesado" : "Procesando..."}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={() => onFileSelect(file.id)}
                          disabled={file.status !== "processed"}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Seleccionar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={() => handleDeleteFile(file.id, file.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar archivo */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el archivo {fileToDelete?.name} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="rounded-lg bg-red-500 hover:bg-red-600" onClick={confirmDelete}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
