"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, LineChart, PieChart, RefreshCw, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"

// Registrar los componentes de Chart.js necesarios para los diferentes tipos de gráficos
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

// Definición de interfaces para los datos de archivo y propiedades del componente
interface FileData {
  id: string
  name: string
  columns: string[]
  data: Record<string, any>[]
}

interface ChartGeneratorProps {
  fileData: FileData
}

// Tipos de gráficos disponibles
type ChartType = "bar" | "line" | "pie"

// Tipo de columna
type ColumnType = "numeric" | "categorical" | "date" | "unknown"

// Interfaz para la información de columna
interface ColumnInfo {
  name: string
  type: ColumnType
  uniqueValues: number
}

/**
 * Componente ChartGenerator
 *
 * Este componente permite generar gráficos dinámicos basados en los datos de un archivo Excel.
 * Soporta tres tipos de gráficos: barras, líneas y circular (pie).
 * Detecta automáticamente columnas numéricas y categóricas para facilitar la selección.
 *
 * @param fileData - Datos del archivo Excel con columnas y registros
 */
export function ChartGenerator({ fileData }: ChartGeneratorProps) {
  // Estados para controlar la selección de ejes, tipo de gráfico y estado de generación
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [isGenerating, setIsGenerating] = useState(false)
  const [chartData, setChartData] = useState<any | null>(null)
  const [chartOptions, setChartOptions] = useState<ChartOptions<any>>({})
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  // Función para determinar si un valor es numérico
  const isNumeric = (value: any): boolean => {
    if (value === null || value === undefined || value === "") return false
    return !isNaN(Number(value)) && isFinite(Number(value))
  }

  // Función para determinar si un valor podría ser una fecha
  const isDate = (value: any): boolean => {
    if (value === null || value === undefined || value === "") return false
    // Intentar convertir a fecha
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  // Analizar todas las columnas y determinar sus tipos y características
  const columnInfo = useMemo(() => {
    const info: Record<string, ColumnInfo> = {}

    fileData.columns.forEach((column) => {
      // Inicializar contadores para cada tipo de valor
      let numericCount = 0
      let nonNumericCount = 0
      let dateCount = 0
      let emptyCount = 0
      const uniqueValues = new Set()

      // Verificar hasta 50 filas para determinar el tipo de columna
      const samplesToCheck = Math.min(fileData.data.length, 50)

      for (let i = 0; i < samplesToCheck; i++) {
        const row = fileData.data[i]
        const value = row[column]

        // Añadir a conjunto de valores únicos
        if (value !== null && value !== undefined && value !== "") {
          uniqueValues.add(String(value))
        } else {
          emptyCount++
        }

        // Verificar el tipo de valor
        if (isNumeric(value)) {
          numericCount++
        } else if (isDate(value)) {
          dateCount++
        } else if (value !== null && value !== undefined && value !== "") {
          nonNumericCount++
        }
      }

      // Determinar el tipo predominante
      let type: ColumnType = "unknown"

      // Si más del 80% de los valores son numéricos, considerarla numérica
      if (numericCount > 0 && numericCount / (samplesToCheck - emptyCount) >= 0.8) {
        type = "numeric"
      }
      // Si más del 80% de los valores son fechas, considerarla fecha
      else if (dateCount > 0 && dateCount / (samplesToCheck - emptyCount) >= 0.8) {
        type = "date"
      }
      // Si hay valores no numéricos, considerarla categórica
      else if (nonNumericCount > 0) {
        type = "categorical"
      }
      // Si no hay suficientes datos, usar heurística basada en nombre de columna
      else if (samplesToCheck - emptyCount === 0) {
        const lowerName = column.toLowerCase()
        if (
          lowerName.includes("fecha") ||
          lowerName.includes("date") ||
          lowerName.includes("time") ||
          lowerName.includes("año") ||
          lowerName.includes("mes")
        ) {
          type = "date"
        } else if (
          lowerName.includes("cantidad") ||
          lowerName.includes("precio") ||
          lowerName.includes("total") ||
          lowerName.includes("valor") ||
          lowerName.includes("monto") ||
          lowerName.includes("number") ||
          lowerName.includes("num") ||
          lowerName.includes("count")
        ) {
          type = "numeric"
        } else {
          type = "categorical"
        }
      }

      info[column] = {
        name: column,
        type,
        uniqueValues: uniqueValues.size,
      }
    })

    return info
  }, [fileData])

  // Extraer columnas por tipo
  const numericColumns = useMemo(
    () =>
      Object.values(columnInfo)
        .filter((col) => col.type === "numeric")
        .map((col) => col.name),
    [columnInfo],
  )

  const categoricalColumns = useMemo(
    () =>
      Object.values(columnInfo)
        .filter((col) => col.type === "categorical" || col.type === "date")
        .map((col) => col.name),
    [columnInfo],
  )

  // Columnas recomendadas para el eje X según el tipo de gráfico
  const recommendedXColumns = useMemo(() => {
    // Para gráficos circulares, preferimos columnas categóricas con pocos valores únicos
    if (chartType === "pie") {
      return Object.values(columnInfo)
        .filter((col) => (col.type === "categorical" || col.type === "date") && col.uniqueValues <= 10)
        .map((col) => col.name)
    }

    // Para otros gráficos, cualquier columna categórica o fecha es buena para el eje X
    return categoricalColumns
  }, [columnInfo, chartType, categoricalColumns])

  // Efecto para seleccionar valores por defecto al cargar el componente o cambiar el tipo de gráfico
  useEffect(() => {
    setError(null)
    setWarning(null)

    // Seleccionar columna X por defecto
    if (recommendedXColumns.length > 0 && (xAxis === "" || !recommendedXColumns.includes(xAxis))) {
      setXAxis(recommendedXColumns[0])
    } else if (recommendedXColumns.length === 0 && numericColumns.length > 0 && xAxis === "") {
      // Si no hay columnas categóricas, usar una numérica para el eje X
      setXAxis(numericColumns[0])
      setWarning("No se detectaron columnas categóricas ideales. Usando una columna numérica para el eje X.")
    }

    // Seleccionar columna Y por defecto (siempre numérica)
    if (numericColumns.length > 0 && (yAxis === "" || (xAxis === yAxis && numericColumns.length > 1))) {
      // Evitar seleccionar la misma columna para X e Y si es posible
      const availableYColumns = numericColumns.filter((col) => col !== xAxis || numericColumns.length === 1)
      setYAxis(availableYColumns[0])
    }

    // Mostrar advertencias según el tipo de gráfico
    if (chartType === "pie" && columnInfo[xAxis]?.uniqueValues > 10) {
      setWarning(
        `El gráfico circular funciona mejor con menos categorías. La columna "${xAxis}" tiene muchos valores únicos.`,
      )
    }

    // Verificar si hay suficientes datos para generar un gráfico
    if (numericColumns.length === 0) {
      setError(
        "No se detectaron columnas numéricas en el archivo. Para generar gráficos, necesitas al menos una columna con valores numéricos.",
      )
    } else if (fileData.data.length === 0) {
      setError("No hay datos suficientes para generar un gráfico.")
    }
  }, [recommendedXColumns, numericColumns, xAxis, yAxis, chartType, columnInfo])

  // Generar datos del gráfico cuando cambian los ejes o el tipo de gráfico
  useEffect(() => {
    if (xAxis && yAxis) {
      handleGenerateChart()
    }
  }, [xAxis, yAxis, chartType])

  /**
   * Genera el gráfico basado en las columnas seleccionadas y el tipo de gráfico
   * Agrega los datos por categoría y aplica estilos modernos
   */
  const handleGenerateChart = () => {
    if (!xAxis || !yAxis) return

    setIsGenerating(true)
    setError(null)

    // Simular un pequeño retraso para mostrar la animación
    setTimeout(() => {
      try {
        // Preparar los datos para el gráfico
        const prepareChartData = () => {
          // Convertir valores de string a número para asegurar que los gráficos funcionen correctamente
          const processedData = fileData.data.map((row) => {
            const newRow = { ...row }
            // Convertir el valor del eje Y a número si es posible
            if (row[yAxis] !== null && row[yAxis] !== undefined) {
              const numValue = Number(row[yAxis])
              if (!isNaN(numValue)) {
                newRow[yAxis] = numValue
              } else {
                newRow[yAxis] = 0 // Valor por defecto si no se puede convertir
              }
            } else {
              newRow[yAxis] = 0
            }
            return newRow
          })

          // Agrupar datos por el eje X y calcular valores para el eje Y
          const aggregatedData: Record<string, { total: number; count: number }> = {}

          processedData.forEach((row) => {
            const key = String(row[xAxis] || "N/A") // Asegurar que la clave sea string
            if (!aggregatedData[key]) {
              aggregatedData[key] = { total: 0, count: 0 }
            }
            aggregatedData[key].total += Number(row[yAxis]) || 0
            aggregatedData[key].count += 1
          })

          // Convertir los datos agregados al formato necesario para Chart.js
          const labels = Object.keys(aggregatedData)
          const values = labels.map((label) => aggregatedData[label].total)

          return { labels, values, aggregatedData }
        }

        const { labels, values, aggregatedData } = prepareChartData()

        // Verificar si hay datos suficientes para el gráfico
        if (labels.length === 0 || values.every((v) => v === 0)) {
          throw new Error("No hay datos suficientes para generar un gráfico con las columnas seleccionadas.")
        }

        // Generar colores sólidos para los gráficos
        const generateSolidColors = (count: number) => {
          // Colores sólidos vibrantes
          const solidColors = [
            "#FF6384", // Rosa
            "#36A2EB", // Azul
            "#FFCE56", // Amarillo
            "#4BC0C0", // Turquesa
            "#9966FF", // Púrpura
            "#FF9F40", // Naranja
            "#32CD32", // Verde lima
            "#BA55D3", // Orquídea
            "#20B2AA", // Verde mar claro
            "#FF6347", // Tomate
            "#1E90FF", // Azul dodger
            "#FFD700", // Oro
          ]

          // Asegurar que tenemos suficientes colores
          const colors = []
          for (let i = 0; i < count; i++) {
            colors.push(solidColors[i % solidColors.length])
          }
          return colors
        }

        const backgroundColor = generateSolidColors(labels.length)
        const borderColor = backgroundColor.map((color) => color) // Mismo color para bordes

        // Calcular el total para porcentajes (útil para gráficos circulares)
        const total = values.reduce((sum, value) => sum + value, 0)

        // Configurar opciones comunes para todos los tipos de gráficos
        const commonOptions: ChartOptions<any> = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top" as const,
              labels: {
                font: {
                  family: "'Plus Jakarta Sans', sans-serif",
                  size: 12,
                },
                color: "#333333", // Color oscuro para mejor contraste
                padding: 20,
                usePointStyle: true,
                pointStyle: "circle",
              },
              title: {
                padding: 20,
              },
            },
            title: {
              display: true,
              text: `${yAxis} por ${xAxis}`,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 18,
                weight: "bold",
              },
              color: "#333333", // Color oscuro para mejor contraste
              padding: {
                top: 20,
                bottom: 20,
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              titleColor: "#333333",
              bodyColor: "#333333",
              borderColor: "#e2e8f0",
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              usePointStyle: true,
              cornerRadius: 8,
              bodyFont: {
                family: "'Plus Jakarta Sans', sans-serif",
              },
              titleFont: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: "bold",
              },
              callbacks: {
                // Personalizar el texto del tooltip para mostrar valores formateados
                label: (context) => {
                  let label = context.dataset.label || ""
                  if (label) {
                    label += ": "
                  }

                  // Para gráficos circulares, mostrar porcentaje
                  if (chartType === "pie") {
                    const value = context.parsed || context.raw
                    const percentage = ((value / total) * 100).toFixed(1)
                    label += `${new Intl.NumberFormat("es-ES").format(value)} (${percentage}%)`
                  } else if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat("es-ES").format(context.parsed.y)
                  }

                  return label
                },
              },
            },
          },
          scales:
            chartType !== "pie"
              ? {
                  x: {
                    grid: {
                      color: "rgba(226, 232, 240, 0.5)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: 12,
                      },
                      color: "#333333",
                      padding: 10,
                    },
                    border: {
                      display: false,
                    },
                  },
                  y: {
                    grid: {
                      color: "rgba(226, 232, 240, 0.5)",
                      drawBorder: false,
                      lineWidth: 1,
                    },
                    ticks: {
                      font: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: 12,
                      },
                      color: "#333333",
                      padding: 10,
                      callback: (value) => new Intl.NumberFormat("es-ES").format(value as number),
                    },
                    border: {
                      display: false,
                    },
                    beginAtZero: true,
                  },
                }
              : undefined,
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
          },
          layout: {
            padding: 20,
          },
          elements: {
            point: {
              radius: 5,
              hoverRadius: 7,
            },
            line: {
              tension: 0.4, // Hace las líneas más curvas
            },
            bar: {
              borderRadius: 8,
            },
            arc: {
              borderWidth: 2,
            },
          },
        }

        // Configurar datos según el tipo de gráfico
        let data
        if (chartType === "bar") {
          data = {
            labels,
            datasets: [
              {
                label: yAxis,
                data: values,
                backgroundColor,
                borderColor,
                borderWidth: 1,
                borderRadius: 8,
                hoverOffset: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
              },
            ],
          }

          // Añadir opciones específicas para efecto 3D en gráfico de barras
          Object.assign(commonOptions, {
            plugins: {
              ...commonOptions.plugins,
              tooltip: {
                ...commonOptions.plugins?.tooltip,
                callbacks: {
                  ...commonOptions.plugins?.tooltip?.callbacks,
                  title: (tooltipItems: any) => tooltipItems[0].label,
                },
              },
            },
            scales: {
              ...commonOptions.scales,
              x: {
                ...commonOptions.scales?.x,
                stacked: false,
              },
              y: {
                ...commonOptions.scales?.y,
                stacked: false,
              },
            },
            elements: {
              ...commonOptions.elements,
              bar: {
                ...commonOptions.elements?.bar,
                // Efecto 3D con sombras
                borderWidth: 1,
                borderColor: borderColor,
                borderSkipped: false,
              },
            },
          })
        } else if (chartType === "line") {
          data = {
            labels,
            datasets: [
              {
                label: yAxis,
                data: values,
                borderColor: borderColor[0],
                backgroundColor: `${backgroundColor[0]}50`, // Añadir transparencia
                tension: 0.4,
                fill: true,
                pointBackgroundColor: borderColor[0],
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: borderColor[0],
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 3,
              },
            ],
          }
        } else if (chartType === "pie") {
          // Calcular porcentajes para las etiquetas
          const percentages = values.map((value) => ((value / total) * 100).toFixed(1) + "%")

          // Crear etiquetas con porcentajes para el gráfico circular
          const labelsWithPercentages = labels.map((label, i) => `${label}: ${percentages[i]}`)

          data = {
            labels: labelsWithPercentages,
            datasets: [
              {
                label: yAxis,
                data: values,
                backgroundColor,
                borderColor: "#fff",
                borderWidth: 2,
                hoverOffset: 20,
                hoverBorderWidth: 3,
                hoverBorderColor: "#fff",
              },
            ],
          }

          // Añadir opciones específicas para gráfico circular
          Object.assign(commonOptions, {
            cutout: "30%", // Menos recorte para un aspecto más 3D
            plugins: {
              ...commonOptions.plugins,
              tooltip: {
                ...commonOptions.plugins?.tooltip,
                callbacks: {
                  ...commonOptions.plugins?.tooltip?.callbacks,
                  title: (tooltipItems: any) => labels[tooltipItems[0].dataIndex],
                },
              },
              // Mostrar etiquetas con valores y porcentajes
              datalabels: {
                formatter: (value: number, ctx: any) => {
                  const percentage = ((value / total) * 100).toFixed(1) + "%"
                  return percentage
                },
                color: "#fff",
                font: {
                  weight: "bold",
                  size: 12,
                },
              },
              legend: {
                ...commonOptions.plugins?.legend,
                position: "right",
                labels: {
                  ...commonOptions.plugins?.legend?.labels,
                  generateLabels: (chart: any) => {
                    const data = chart.data
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label: string, i: number) => {
                        const value = data.datasets[0].data[i]
                        const percentage = ((value / total) * 100).toFixed(1)
                        const originalLabel = labels[i]

                        return {
                          text: `${originalLabel}: ${new Intl.NumberFormat("es-ES").format(value)} (${percentage}%)`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: !chart.getDataVisibility(i),
                          index: i,
                        }
                      })
                    }
                    return []
                  },
                },
              },
            },
            elements: {
              ...commonOptions.elements,
              arc: {
                ...commonOptions.elements?.arc,
                borderWidth: 2,
                borderColor: "#fff",
              },
            },
          })
        }

        setChartData(data)
        setChartOptions(commonOptions)
      } catch (err) {
        console.error("Error al generar el gráfico:", err)
        setError(`Error al generar el gráfico: ${err instanceof Error ? err.message : "Error desconocido"}`)
        setChartData(null)
      } finally {
        setIsGenerating(false)
      }
    }, 800)
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm p-6">
      <div className="space-y-6">
        {/* Selección de tipo de gráfico */}
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl ${chartType === "bar" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            onClick={() => setChartType("bar")}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Barras
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl ${chartType === "line" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            onClick={() => setChartType("line")}
          >
            <LineChart className="h-4 w-4 mr-1" />
            Líneas
          </Button>
          <Button
            variant={chartType === "pie" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl ${chartType === "pie" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            onClick={() => setChartType("pie")}
          >
            <PieChart className="h-4 w-4 mr-1" />
            Circular
          </Button>
        </div>

        {/* Selección de columnas para los ejes X e Y */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Columna X {chartType === "pie" ? "(Categorías)" : "(Eje horizontal)"}
            </label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="rounded-xl border-blue-100 dark:border-blue-900 focus:ring-blue-500 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {fileData.columns.map((column) => {
                  const info = columnInfo[column]
                  const isRecommended = recommendedXColumns.includes(column)
                  const label = `${column} (${info?.type === "numeric" ? "Numérica" : info?.type === "categorical" ? "Categórica" : info?.type === "date" ? "Fecha" : "Desconocida"})`

                  return (
                    <SelectItem
                      key={column}
                      value={column}
                      className={isRecommended ? "font-medium text-blue-600 dark:text-blue-400" : ""}
                    >
                      {label} {isRecommended && chartType === "pie" ? "✓" : ""}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {chartType === "pie" && columnInfo[xAxis]?.uniqueValues > 10 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Esta columna tiene muchos valores únicos ({columnInfo[xAxis]?.uniqueValues}). El gráfico circular
                funciona mejor con menos categorías.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Columna Y {chartType === "pie" ? "(Valores)" : "(Eje vertical)"}
            </label>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger className="rounded-xl border-blue-100 dark:border-blue-900 focus:ring-blue-500 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {numericColumns.length > 0
                  ? numericColumns.map((column) => (
                      <SelectItem key={column} value={column} className="font-medium">
                        {column} (Numérica)
                      </SelectItem>
                    ))
                  : fileData.columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column} {columnInfo[column]?.type === "numeric" ? "(Numérica)" : "(No ideal para valores)"}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {numericColumns.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No se detectaron columnas numéricas. Los gráficos funcionan mejor con datos numéricos.
              </p>
            )}
          </div>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mostrar advertencia si existe */}
        {warning && !error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        {/* Botón para actualizar el gráfico */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateChart}
            className="rounded-xl bg-blue-500 hover:bg-blue-600 shadow-sm"
            disabled={!xAxis || !yAxis || isGenerating || !!error}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>Actualizar gráfico</>
            )}
          </Button>
        </div>

        {/* Contenedor del gráfico con altura aumentada y fondo más claro */}
        <div className="h-[500px] w-full mt-4 rounded-xl overflow-hidden border p-6 bg-white shadow-md">
          <AnimatePresence mode="wait">
            {!chartData && !isGenerating && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full bg-white"
              >
                <p className="text-sm text-muted-foreground">Selecciona columnas para visualizar un gráfico</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full bg-white"
              >
                <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Generando gráfico...</p>
              </motion.div>
            )}

            {chartData && !isGenerating && (
              <motion.div
                key={`chart-${chartType}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full bg-white"
              >
                {chartType === "bar" && <Bar data={chartData} options={chartOptions} />}
                {chartType === "line" && <Line data={chartData} options={chartOptions} />}
                {chartType === "pie" && <Pie data={chartData} options={chartOptions} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


