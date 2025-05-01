"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, BarChart3, FileSpreadsheet, Brain, Github, Twitter, Linkedin, ArrowRight } from "lucide-react"
import Link from "next/link"
import { DemoDialog } from "@/components/demo-dialog"
import { HowItWorksDialog } from "@/components/how-it-works-dialog"
import { MeetingDialog } from "@/components/meeting-dialog"
import { LoginDialog } from "@/components/login-dialog"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { useRef } from "react"

export default function Home() {
  const [demoDialogOpen, setDemoDialogOpen] = useState(false)
  const [howItWorksDialogOpen, setHowItWorksDialogOpen] = useState(false)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

  // Refs for scroll animations
  const servicesRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Check if elements are in view
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 })
  const faqInView = useInView(faqRef, { once: true, amount: 0.2 })
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 })

  // Scroll progress for parallax effects
  const { scrollYProgress } = useScroll()
  const smoothScrollYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Parallax values
  const heroImageY = useTransform(smoothScrollYProgress, [0, 0.2], [0, -50])
  const heroTextY = useTransform(smoothScrollYProgress, [0, 0.2], [0, 30])

  // Staggered card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <FileSpreadsheet className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">Excelia</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                className="rounded-full group relative overflow-hidden h-10"
                variant="outline"
                onClick={() => setLoginDialogOpen(true)}
              >
                <span className="relative z-10">Iniciar sesión</span>
                <span className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                <span className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out delay-75"></span>
                <span className="absolute inset-0 bg-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out delay-150"></span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32 overflow-hidden">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              className="space-y-8"
              style={{ y: heroTextY }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl font-bold tracking-wide sm:text-5xl xl:text-6xl/none">
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Conecta
                </span>{" "}
                Inteligencia Artificial con tus Hojas de Cálculo
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Automatiza tareas, analiza datos y potencia tus decisiones directamente desde Excel.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <Button
                  size="lg"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group relative overflow-hidden h-12 px-6"
                  onClick={() => setDemoDialogOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    Solicitar Demo
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full transition-all duration-300 hover:shadow-lg group relative overflow-hidden h-12 px-6"
                  onClick={() => setHowItWorksDialogOpen(true)}
                >
                  <span className="relative z-10">Ver cómo funciona</span>
                  <span className="absolute inset-0 bg-blue-50 dark:bg-blue-950 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center justify-center"
              style={{ y: heroImageY }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 0.9, 0.7],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                >
                  <div className="h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                </motion.div>
                <div className="relative flex h-full items-center justify-center">
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div
                      className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -10, rotate: -5, scale: 1.05 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        y: { repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" },
                        rotate: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                        <FileSpreadsheet className="h-12 w-12 text-blue-500" />
                      </div>
                    </motion.div>
                    <motion.div
                      className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -10, rotate: 5, scale: 1.05 }}
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        y: { repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "easeInOut", delay: 0.5 },
                        rotate: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                        <Brain className="h-12 w-12 text-blue-500" />
                      </div>
                    </motion.div>
                    <motion.div
                      className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -10, rotate: -5, scale: 1.05 }}
                      animate={{ y: [0, -12, 0] }}
                      transition={{
                        y: { repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut", delay: 1 },
                        rotate: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                        <BarChart3 className="h-12 w-12 text-blue-500" />
                      </div>
                    </motion.div>
                    <motion.div
                      className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -10, rotate: 5, scale: 1.05 }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        y: { repeat: Number.POSITIVE_INFINITY, duration: 3.5, ease: "easeInOut", delay: 1.5 },
                        rotate: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-12 w-12 text-blue-500"
                        >
                          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-muted/50 py-24 relative overflow-hidden" ref={servicesRef}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/80 dark:to-background/20 pointer-events-none"></div>
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 8,
              ease: "easeInOut",
            }}
          ></motion.div>
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 8,
              ease: "easeInOut",
              delay: 1,
            }}
          ></motion.div>

          <div className="container relative z-10">
            <motion.div
              className="mx-auto mb-20 max-w-2xl text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={servicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-3xl font-bold tracking-wide sm:text-4xl">¿Qué podemos automatizar por ti?</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Nuestras soluciones de integración entre IA y Excel transforman tu forma de trabajar con datos.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={servicesInView ? "visible" : "hidden"}
                >
                  <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-md transition-all hover:shadow-xl hover:-translate-y-2 rounded-2xl overflow-hidden group h-full">
                    <CardHeader className="pb-2">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform duration-300">
                        {i === 0 && <FileSpreadsheet className="h-6 w-6 text-blue-500" />}
                        {i === 1 && <Brain className="h-6 w-6 text-blue-500" />}
                        {i === 2 && <BarChart3 className="h-6 w-6 text-blue-500" />}
                      </div>
                      <CardTitle>
                        {i === 0 && "Automatización de reportes"}
                        {i === 1 && "Análisis predictivo"}
                        {i === 2 && "Dashboards inteligentes"}
                      </CardTitle>
                      <CardDescription>
                        {i === 0 && "Genera reportes automáticos con análisis avanzados sin salir de Excel."}
                        {i === 1 && "Aprovecha el poder de la IA para predecir tendencias desde tus datos en Excel."}
                        {i === 2 && "Visualiza tus datos con dashboards dinámicos potenciados por IA."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex items-center">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                              ease: "easeInOut",
                              delay: i * 0.3,
                            }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-500" />
                          </motion.div>
                          <span>
                            {i === 0 && "Reportes periódicos automatizados"}
                            {i === 1 && "Modelos predictivos sin código"}
                            {i === 2 && "Visualizaciones interactivas"}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                              ease: "easeInOut",
                              delay: i * 0.3 + 0.3,
                            }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-500" />
                          </motion.div>
                          <span>
                            {i === 0 && "Extracción de datos inteligente"}
                            {i === 1 && "Detección de anomalías"}
                            {i === 2 && "Actualización en tiempo real"}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                              ease: "easeInOut",
                              delay: i * 0.3 + 0.6,
                            }}
                          >
                            <ChevronRight className="mr-2 h-4 w-4 text-blue-500" />
                          </motion.div>
                          <span>
                            {i === 0 && "Formatos personalizados"}
                            {i === 1 && "Previsión de tendencias"}
                            {i === 2 && "Insights automáticos"}
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 relative overflow-hidden" ref={faqRef}>
          <div className="container relative z-10">
            <motion.div
              className="mx-auto mb-20 max-w-2xl text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-3xl font-bold tracking-wide sm:text-4xl">Preguntas frecuentes</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Respuestas a las dudas más comunes sobre nuestra integración de IA con Excel.
              </p>
            </motion.div>
            <motion.div
              className="mx-auto max-w-3xl"
              initial={{ opacity: 0, y: 40 }}
              animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "¿Puedo usarlo con Excel online y en escritorio?",
                    answer:
                      "Sí, nuestra solución es compatible tanto con Microsoft Excel Online como con las versiones de escritorio para Windows y Mac. La integración funciona a través de un complemento que se instala directamente en tu aplicación de Excel.",
                  },
                  {
                    question: "¿Necesito conocimientos de programación para usar la herramienta?",
                    answer:
                      "No, nuestra solución está diseñada para ser utilizada sin necesidad de conocimientos de programación. La interfaz es intuitiva y amigable, permitiéndote aprovechar el poder de la IA sin escribir código.",
                  },
                  {
                    question: "¿Mis datos están seguros con esta integración?",
                    answer:
                      "La seguridad es nuestra prioridad. Todos los datos se procesan con los más altos estándares de seguridad y cumplimos con las normativas GDPR y CCPA. No almacenamos tus datos y utilizamos conexiones cifradas para todas las transferencias.",
                  },
                  {
                    question: "¿Cuánto tiempo lleva implementar la solución?",
                    answer:
                      "La implementación básica puede realizarse en menos de un día. Para integraciones más complejas o personalizadas, nuestro equipo de soporte te guiará durante todo el proceso, que generalmente toma entre 2 y 5 días dependiendo de tus necesidades específicas.",
                  },
                  {
                    question: "¿Ofrecen soporte técnico y capacitación?",
                    answer:
                      "Sí, todos nuestros planes incluyen soporte técnico. Además, ofrecemos sesiones de capacitación personalizadas para asegurar que tu equipo aproveche al máximo todas las funcionalidades de nuestra solución.",
                  },
                ].map((item, i) => (
                  <AccordionItem
                    key={`item-${i + 1}`}
                    value={`item-${i + 1}`}
                    className="border-b border-blue-100 dark:border-blue-900 overflow-hidden"
                  >
                    <AccordionTrigger className="text-lg font-medium hover:text-blue-500 transition-colors py-5 group">
                      <span className="group-hover:text-blue-500">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground overflow-hidden text-base">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.answer}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="bg-gradient-to-br from-blue-800 to-blue-900 py-24 text-white relative overflow-hidden"
          ref={ctaRef}
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=500&width=500')] bg-repeat opacity-5"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 30,
              ease: "linear",
              repeatType: "mirror",
            }}
          ></motion.div>

          <div className="container relative z-10">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h2
                className="text-3xl font-bold tracking-wide sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Lleva tu Excel al siguiente nivel con IA
              </motion.h2>
              <motion.p
                className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Descubre cómo nuestra solución puede transformar tu forma de trabajar con datos y automatizar procesos.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-10"
              >
                <Button
                  size="lg"
                  className="rounded-full bg-white text-blue-900 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group h-12 px-6"
                  onClick={() => setMeetingDialogOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    Agendar reunión
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold">Excelia</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Transformando la forma en que las empresas trabajan con datos en Excel a través de la inteligencia
                artificial.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Empresa</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Carreras
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Servicios</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Automatización
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Análisis predictivo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Dashboards
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Recursos</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Guías
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground hover:underline">
                    Documentación
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">&copy; 2024 Excelia. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Twitter className="h-5 w-5" />
                </motion.div>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Github className="h-5 w-5" />
                </motion.div>
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Linkedin className="h-5 w-5" />
                </motion.div>
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <DemoDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
      <HowItWorksDialog open={howItWorksDialogOpen} onOpenChange={setHowItWorksDialogOpen} />
      <MeetingDialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen} />
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </div>
  )
}
