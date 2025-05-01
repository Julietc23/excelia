// Componente para mostrar los detalles de un archivo seleccionado
"use client"

import { useState, useEffect } from "react"
import { FilePreview } from "@/components/file-preview"
import { AiChat } from "@/components/ai-chat"
import { ChartGenerator } from "@/components/chart-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, BarChart3, AlertCircle } from "lucide-react"

/**
 * Propiedades para el componente FileDetail
 */
interface FileDetailProps {
  fileId: string
}

// Definir la interfaz para los datos del archivo
interface FileData {
  id: string
  name: string
  columns: string[]
  data: Record<string, any>[]
}

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Datos de ejemplo para usar cuando el backend no está disponible
const FALLBACK_FILE_DATA: FileData = {
  id: "example-file-1",
  name: "Ventas_2023_Q1.xlsx",
  columns: ["Mes", "Producto", "Región", "Ventas", "Costos", "Ganancias"],
  data: [
    { Mes: "Enero", Producto: "Laptop", Región: "Norte", Ventas: 12500, Costos: 8000, Ganancias: 4500 },
    { Mes: "Enero", Producto: "Teléfono", Región: "Norte", Ventas: 8000, Costos: 4000, Ganancias: 4000 },
    { Mes: "Enero", Producto: "Tablet", Región: "Sur", Ventas: 5000, Costos: 2500, Ganancias: 2500 },
    { Mes: "Febrero", Producto: "Laptop", Región: "Norte", Ventas: 10000, Costos: 7000, Ganancias: 3000 },
    { Mes: "Febrero", Producto: "Teléfono", Región: "Sur", Ventas: 9500, Costos: 4200, Ganancias: 5300 },
  ],
}

export function FileDetail({ fileId }: FileDetailProps) {
  // Estado para controlar las pestañas activas en móvil
  const [activeTab, setActiveTab] = useState("preview")
  // Estado para controlar la herramienta activa en escritorio
  const [activeToolTab, setActiveToolTab] = useState<"chat" | "chart">("chat")
  // Detectar si es un dispositivo móvil
  const isMobile = useMediaQuery("(max-width: 768px)")
  // Estado para almacenar los datos del archivo
  const [fileData, setFileData] = useState<FileData | null>(null)
  // Estado para indicar carga
  const [isLoading, setIsLoading] = useState(true)
  // Estado para errores
  const [error, setError] = useState<string | null>(null)
  // Estado para indicar si se está usando datos de respaldo
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  // Cargar los datos del archivo cuando cambia fileId
  useEffect(() => {
    const fetchFileData = async () => {
      if (!fileId) {
        setFileData(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Verificar si estamos usando un ID de archivo de ejemplo
        if (fileId.startsWith("example-file")) {
          // Usar datos de ejemplo
          setFileData(FALLBACK_FILE_DATA)
          setUsingFallbackData(true)
          return
        }

        const response = await fetch(`${API_BASE_URL}/files/${fileId}/preview`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // Aumentar el timeout para evitar errores prematuros
          signal: AbortSignal.timeout(10000), // 10 segundos de timeout
        })

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Transformar los datos al formato esperado por los componentes
        const transformedData: FileData = {
          id: fileId,
          name: data.filename,
          columns: data.column_names,
          data: data.preview_data,
        }

        setFileData(transformedData)
        setUsingFallbackData(false)
      } catch (error) {
        console.error("Error al cargar los datos del archivo:", error)

        // Usar datos de respaldo
        setFileData(FALLBACK_FILE_DATA)
        setUsingFallbackData(true)

        setError("No se pudieron cargar los datos del archivo desde el servidor. Mostrando datos de ejemplo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFileData()
  }, [fileId])

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando datos del archivo...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje si no hay archivo seleccionado
  if (!fileData) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md p-8">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona un archivo para ver sus detalles</p>
        </div>
      </div>
    )
  }

  // Renderizado para dispositivos móviles
  if (isMobile) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950">
          <h2 className="text-xl font-semibold">{fileData.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">Analiza y visualiza tus datos</p>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="mx-6 my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 bg-blue-50/50 dark:bg-blue-950/30 pt-4">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-blue-100/50 dark:bg-blue-900/50">
              <TabsTrigger
                value="preview"
                className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Vista previa
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Chat IA
              </TabsTrigger>
              <TabsTrigger
                value="chart"
                className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Gráficos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="p-6">
            <FilePreview fileData={fileData} />
          </TabsContent>

          <TabsContent value="chat" className="p-6">
            <AiChat fileData={fileData} usingFallbackData={usingFallbackData} />
          </TabsContent>

          <TabsContent value="chart" className="p-6">
            <ChartGenerator fileData={fileData} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Renderizado para escritorio
  return (
    <div className="flex flex-col gap-8">
      {/* Vista previa del archivo - Siempre visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950">
          <h2 className="text-xl font-semibold">{fileData.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">Vista previa del archivo</p>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="mx-6 my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="p-6">
          <FilePreview fileData={fileData} />
        </div>
      </motion.div>

      {/* Herramientas de análisis - Chat y Gráficos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border bg-white dark:bg-slate-900 shadow-md overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Herramientas de análisis</h2>
          <div className="flex gap-2">
            <Button
              variant={activeToolTab === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveToolTab("chat")}
              className={`rounded-xl ${activeToolTab === "chat" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat IA
            </Button>
            <Button
              variant={activeToolTab === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveToolTab("chart")}
              className={`rounded-xl ${activeToolTab === "chart" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Gráficos
            </Button>
          </div>
        </div>
        <div className="p-6">
          {activeToolTab === "chat" ? (
            <AiChat fileData={fileData} usingFallbackData={usingFallbackData} />
          ) : (
            <ChartGenerator fileData={fileData} />
          )}
        </div>
      </motion.div>
    </div>
  )
}
