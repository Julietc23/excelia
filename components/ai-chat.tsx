// Componente de chat con IA para consultas sobre los datos
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

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
 * Propiedades para el componente AiChat
 */
interface AiChatProps {
  fileData: FileData
  usingFallbackData?: boolean
}

/**
 * Interfaz para los mensajes del chat
 */
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// URL base del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Ejemplos de respuestas para simular la IA
const AI_RESPONSES = [
  "Según los datos, marzo fue el mes con mayores ventas, alcanzando un total de 33,500.",
  "El producto con mayores ganancias fue el teléfono, con un total de 15,300 en el trimestre.",
  "La región Norte generó las mayores ventas con un total de 41,500 durante el periodo analizado.",
  "Las ganancias totales del trimestre fueron de 38,300, con un margen promedio del 48%.",
  "Febrero tuvo el menor rendimiento en ventas de laptops, con solo 10,000 unidades vendidas.",
]

// Function to retry a failed request
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries} to fetch ${url}`)
      const response = await fetch(url, options)
      return response
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500 // 500ms, 1000ms, 2000ms, etc.
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Failed after multiple retry attempts")
}

// Function to generate a simulated AI response based on the data and question
const generateSimulatedResponse = (question: string, data: Record<string, any>[]): string => {
  // Convert question to lowercase for easier matching
  const q = question.toLowerCase()

  // Extract some basic stats from the data for more realistic responses
  const numRows = data.length
  const columnNames = Object.keys(data[0] || {})

  // Check for common question patterns
  if (
    q.includes("cuántas") ||
    q.includes("cuantas") ||
    q.includes("número") ||
    q.includes("numero") ||
    q.includes("total")
  ) {
    return `Hay un total de ${numRows} registros en los datos analizados.`
  }

  if (q.includes("columnas") || q.includes("campos")) {
    return `Los datos contienen las siguientes columnas: ${columnNames.join(", ")}.`
  }

  if (q.includes("promedio") || q.includes("media") || q.includes("average")) {
    // Find a numeric column to calculate average
    const numericColumns = columnNames.filter((col) => {
      return data.some((row) => typeof row[col] === "number" || !isNaN(Number(row[col])))
    })

    if (numericColumns.length > 0) {
      const column = numericColumns[0]
      const values = data.map((row) => Number(row[column])).filter((val) => !isNaN(val))
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length
      return `El promedio de ${column} es aproximadamente ${avg.toFixed(2)}.`
    }
  }

  // Default to a random response if no pattern matches
  return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
}

/**
 * Componente AiChat
 *
 * Proporciona una interfaz de chat para interactuar con IA y hacer preguntas
 * sobre los datos del archivo seleccionado.
 *
 * @param fileData - Datos del archivo sobre el que se harán consultas
 * @param usingFallbackData - Indica si se están usando datos de respaldo
 */
export function AiChat({ fileData, usingFallbackData = false }: AiChatProps) {
  // Estado para los mensajes del chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hola, soy tu asistente de análisis para ${fileData.name}. ¿Qué te gustaría saber sobre estos datos?`,
    },
  ])
  // Estado para el texto de entrada
  const [input, setInput] = useState("")
  // Estado para indicar si se está procesando una respuesta
  const [isLoading, setIsLoading] = useState(false)
  // Referencia al área de desplazamiento para auto-scroll
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  /**
   * Maneja el envío de un mensaje por parte del usuario
   *
   * @param e - Evento del formulario
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Crear mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      if (usingFallbackData) {
        // Si estamos usando datos de respaldo, simular respuesta
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simular retraso

        // Seleccionar una respuesta aleatoria
        const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]

        // Crear mensaje de respuesta simulada
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: randomResponse + " (Respuesta simulada)",
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        // Enviar la pregunta al backend real
        const response = await fetchWithRetry(
          `${API_BASE_URL}/chat/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: fileData.id,
              question: input.trim(),
            }),
            signal: AbortSignal.timeout(15000), // 15 segundos de timeout
          },
          2, // Maximum 2 retry attempts
        )

        if (!response.ok) {
          console.error(`Server error: ${response.status} ${response.statusText}`)

          // Try to get more detailed error information if available
          let errorMessage = `Error: ${response.statusText}`
          try {
            const errorData = await response.text()
            console.error("Error details:", errorData)
            errorMessage = `Server error: ${errorData || response.statusText}`
          } catch (textError) {
            console.error("Could not parse error details:", textError)
          }

          // Instead of throwing, we'll use the fallback mechanism
          throw new Error(errorMessage)
        }

        // Procesar la respuesta
        const data = await response.json()

        // Crear mensaje de respuesta de la IA
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
        }

        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (error) {
      console.error("Error processing the question:", error)

      // Provide more informative error message
      const errorMessageText = error instanceof Error ? error.message : "Unknown error occurred"

      // Generate a more intelligent simulated response based on the data
      const simulatedResponse = generateSimulatedResponse(input.trim(), fileData.data)

      // Mensaje de error/fallback
      const aiErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `No pude conectarme al servidor de IA. Aquí hay una respuesta basada en análisis local: ${simulatedResponse}`,
      }

      setMessages((prev) => [...prev, aiErrorMessage])

      // Show toast of error
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor de IA. Mostrando respuesta simulada.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[400px] border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {usingFallbackData && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs">
            Modo simulación: Las respuestas son generadas localmente y no reflejan análisis real.
          </p>
        </div>
      )}

      <div className="flex-1">
        <ScrollArea className="h-[340px] p-4" ref={scrollAreaRef}>
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 mb-4 ${message.role === "assistant" ? "" : "justify-end"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] shadow-sm ${
                    message.role === "assistant"
                      ? "bg-blue-50 dark:bg-blue-950/50"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 mb-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4 text-blue-500" />
                </div>
                <div className="rounded-2xl px-4 py-2 bg-blue-50 dark:bg-blue-950/50 shadow-sm">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
      <div className="p-4 border-t bg-blue-50/50 dark:bg-blue-950/30">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Haz preguntas sobre los datos de tu archivo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-full border-blue-100 dark:border-blue-900 focus-visible:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
