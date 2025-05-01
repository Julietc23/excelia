"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full transition-all duration-300 hover:scale-110 w-10 h-10"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100" />
        <span className="sr-only">Cambiar tema</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-all duration-300 hover:scale-110 w-10 h-10 relative overflow-hidden"
    >
      <div className="relative z-10">
        {theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-blue-500" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-blue-500" />
        )}
      </div>
      <span className="absolute inset-0 bg-blue-50 dark:bg-blue-950 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
