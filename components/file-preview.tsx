// Componente para mostrar una vista previa de los datos del archivo
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

/**
 * Interfaz para los datos del archivo
 */
interface FileData {
  id: string
  name: string
  columns: string[]
  data: Record<string, any>[]
}

/**
 * Propiedades para el componente FilePreview
 */
interface FilePreviewProps {
  fileData: FileData
}

/**
 * Componente FilePreview
 *
 * Muestra una vista previa de los datos del archivo en formato de tabla.
 * Incluye encabezados de columnas y filas de datos con formato adecuado.
 *
 * @param fileData - Datos del archivo a mostrar
 */
export function FilePreview({ fileData }: FilePreviewProps) {
  const [processedData, setProcessedData] = useState<{
    columns: string[]
    data: Record<string, any>[]
  }>({ columns: [], data: [] })
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Procesar los datos cuando cambia fileData
  useEffect(() => {
    try {
      // Verificar si los datos tienen la estructura esperada
      if (!fileData.columns || fileData.columns.length === 0) {
        throw new Error("No se pudieron detectar columnas en el archivo")
      }

      if (!fileData.data || fileData.data.length === 0) {
        throw new Error("No se encontraron datos en el archivo")
      }

      // Los datos ya deberían estar en el formato correcto desde el backend
      setProcessedData({
        columns: fileData.columns,
        data: fileData.data,
      })

      setHasError(false)
      setErrorMessage("")
    } catch (error) {
      console.error("Error al procesar datos:", error)
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido al procesar los datos")

      // Establecer datos vacíos
      setProcessedData({ columns: [], data: [] })
    }
  }, [fileData])

  // Función para verificar si un valor es numérico
  const isNumeric = (value: any): boolean => {
    if (value === null || value === undefined || value === "") return false
    return !isNaN(Number(value)) && isFinite(Number(value))
  }

  // Función para formatear valores según su tipo
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return ""
    }

    if (isNumeric(value)) {
      return new Intl.NumberFormat("es-ES").format(Number(value))
    }

    return String(value)
  }

  // Si hay un error o no hay datos procesados, mostrar mensaje
  if (hasError || processedData.columns.length === 0) {
    return (
      <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-6 flex items-start gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Error al mostrar la vista previa</h3>
            <p className="text-sm mt-1">
              {errorMessage || "No se pudieron procesar los datos del archivo correctamente"}
            </p>
            <p className="text-sm mt-3">
              Detalles técnicos: El archivo tiene {fileData.columns.length} columnas y {fileData.data.length} filas.
            </p>
            <pre className="text-xs mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-auto max-h-40">
              {JSON.stringify(fileData.data[0], null, 2)}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <ScrollArea className="h-[400px] rounded-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="bg-blue-50 dark:bg-blue-950">
                {processedData.columns.map((column, index) => (
                  <TableHead key={`col-${index}`} className="font-medium text-blue-900 dark:text-blue-100">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.data.map((row, rowIndex) => (
                <TableRow
                  key={`row-${rowIndex}`}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-colors"
                >
                  {processedData.columns.map((column, colIndex) => (
                    <TableCell key={`cell-${rowIndex}-${colIndex}`}>{formatValue(row[column])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  )
}
