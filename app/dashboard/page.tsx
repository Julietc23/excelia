"use client"

import { useState, useEffect } from "react"
import { FileTable } from "@/components/file-table"
import { FileDetail } from "@/components/file-detail"
import { UploadDialog } from "@/components/upload-dialog"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario ha iniciado sesión
    const email = localStorage.getItem("userEmail")
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

    if (email && isAuthenticated) {
      setUserEmail(email)
      setIsLoading(false)
    } else {
      // Si no hay sesión, redirigir al inicio
      router.push("/")
    }
  }, [router])

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId)
  }

  const handleLogout = () => {
    localStorage.removeItem("userEmail")
    localStorage.removeItem("isAuthenticated")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-blue-500"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 13h2" />
                <path d="M8 17h2" />
                <path d="M14 13h2" />
                <path d="M14 17h2" />
              </svg>
              <span className="text-xl font-bold">Excelia</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-blue-500" />
                <span className="sr-only">Volver al inicio</span>
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="outline" size="sm" className="rounded-full text-sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button onClick={() => setIsUploadDialogOpen(true)} className="rounded-full bg-blue-500 hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              Cargar archivo
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <FileTable onFileSelect={handleFileSelect} selectedFileId={selectedFileId} />
          </motion.div>

          {selectedFileId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FileDetail fileId={selectedFileId} />
            </motion.div>
          )}
        </div>
      </main>

      <UploadDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} />
    </div>
  )
}

