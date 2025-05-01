// Componente de chat con IA para consultas sobre los datos
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

interface FileData {
  id: string
  name: string
  columns: string[]
  data: Record<string, any>[]
}

interface AiChatProps {
  fileData: FileData
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export function AiChat({ fileData }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hola, soy tu asistente de análisis para ${fileData.name}. ¿Qué te gustaría saber sobre estos datos?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileData.id,
          question: input.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error 
          ? error.message 
          : "Error al procesar tu pregunta",
      }
      setMessages((prev) => [...prev, errorMessage])
      toast({
        title: "Error",
        description: "No se pudo obtener una respuesta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[400px] border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
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
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
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
          </Button>
        </form>
      </div>
    </div>
  )
}
