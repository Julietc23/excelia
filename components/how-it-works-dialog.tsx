"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Brain, BarChart3 } from "lucide-react"

export function HowItWorksDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-2xl border-none shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">¿Cómo funciona?</DialogTitle>
          <DialogDescription>
            Descubre cómo nuestra tecnología integra la IA con Excel para transformar tu trabajo con datos.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger
              value="connect"
              className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Conectar
            </TabsTrigger>
            <TabsTrigger
              value="analyze"
              className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Analizar
            </TabsTrigger>
            <TabsTrigger
              value="automate"
              className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Automatizar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="connect" className="mt-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Conecta tus hojas de cálculo</CardTitle>
                  <CardDescription>Integración sencilla con tus archivos de Excel existentes</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-[200px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Instala nuestro complemento directamente en Excel</p>
                      <p className="mt-2 text-sm text-muted-foreground">Compatible con Excel Online, Windows y Mac</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analyze" className="mt-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Analiza con IA</CardTitle>
                  <CardDescription>Procesa tus datos con modelos avanzados de IA</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-[200px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Detecta patrones y tendencias automáticamente</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Obtén insights que no podrías ver manualmente
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="automate" className="mt-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Automatiza procesos</CardTitle>
                  <CardDescription>Crea flujos de trabajo inteligentes sin código</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-[200px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Programa reportes periódicos automáticos</p>
                      <p className="mt-2 text-sm text-muted-foreground">Actualiza dashboards en tiempo real</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
