"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, LineChart, PieChart, RefreshCw } from "lucide-react"
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

  // Determinar columnas numéricas y categóricas automáticamente
  const numericColumns = useMemo(() => {
    return fileData.columns.filter((column) => fileData.data.some((row) => typeof row[column] === "number"))
  }, [fileData])

  const categoricalColumns = useMemo(() => {
    return fileData.columns.filter((column) => fileData.data.some((row) => typeof row[column] === "string"))
  }, [fileData])

  // Efecto para seleccionar valores por defecto al cargar el componente
  useEffect(() => {
    if (categoricalColumns.length > 0 && xAxis === "") {
      setXAxis(categoricalColumns[0])
    }
    if (numericColumns.length > 0 && yAxis === "") {
      setYAxis(numericColumns[0])
    }
  }, [categoricalColumns, numericColumns, xAxis, yAxis])

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

    // Simular un pequeño retraso para mostrar la animación
    setTimeout(() => {
      // Agrupar datos por el eje X y calcular valores para el eje Y
      const aggregatedData: Record<string, { total: number; count: number }> = {}

      fileData.data.forEach((row) => {
        const key = row[xAxis]
        if (!aggregatedData[key]) {
          aggregatedData[key] = { total: 0, count: 0 }
        }
        aggregatedData[key].total += row[yAxis] || 0
        aggregatedData[key].count += 1
      })

      // Convertir los datos agregados al formato necesario para Chart.js
      const labels = Object.keys(aggregatedData)
      const values = labels.map((label) => aggregatedData[label].total)

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
                if (context.parsed.y !== null) {
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
        data = {
          labels,
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

        // Añadir opciones específicas para efecto 3D en gráfico circular
        Object.assign(commonOptions, {
          cutout: "30%", // Menos recorte para un aspecto más 3D
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
      setIsGenerating(false)
    }, 800)
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm p-6">
      <div className="space-y-6">
        {/* Selección de columnas para los ejes X e Y */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Columna X (Categoría)</label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="rounded-xl border-blue-100 dark:border-blue-900 focus:ring-blue-500 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categoricalColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Columna Y (Valor)</label>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger className="rounded-xl border-blue-100 dark:border-blue-900 focus:ring-blue-500 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {numericColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones para seleccionar el tipo de gráfico y actualizar */}
        <div className="flex items-center justify-between">
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

          <Button
            onClick={handleGenerateChart}
            className="rounded-xl bg-blue-500 hover:bg-blue-600 shadow-sm"
            disabled={!xAxis || !yAxis || isGenerating}
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
