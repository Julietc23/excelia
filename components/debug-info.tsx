"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugInfo() {
  const [showInfo, setShowInfo] = useState(false)
  const [apiResponse, setApiResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setApiResponse(null)

    try {
      // Intentar conectar con el endpoint raíz del backend
      const response = await fetch(`${apiUrl.replace("/api", "")}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000),
      })

      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(`Error de conexión: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Información de depuración
          <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)}>
            {showInfo ? "Ocultar" : "Mostrar"}
          </Button>
        </CardTitle>
        <CardDescription>Información para solucionar problemas de conexión</CardDescription>
      </CardHeader>
      {showInfo && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Variable de entorno API URL:</h3>
              <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded block">{apiUrl}</code>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={isLoading}>
                {isLoading ? "Probando..." : "Probar conexión"}
              </Button>
            </div>

            {apiResponse && (
              <div>
                <h3 className="font-medium mb-1">Respuesta del servidor:</h3>
                <pre className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm overflow-auto max-h-40">
                  {apiResponse}
                </pre>
              </div>
            )}

            {error && (
              <div>
                <h3 className="font-medium mb-1">Error:</h3>
                <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm overflow-auto max-h-40">{error}</pre>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
