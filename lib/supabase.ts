import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://hfkbmemelekyufpmbrho.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhma2JtZW1lbGVreXVmcG1icmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjkxNzMsImV4cCI6MjA2MDMwNTE3M30.y5gWI-z6y7DD1U1NrkrNEVkEyreelpL3yjMdhRA9XIo"

// Crear el cliente de Supabase con opciones adicionales para depuración
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // No persistir la sesión para evitar problemas
    autoRefreshToken: false, // No refrescar el token automáticamente
  },
  global: {
    fetch: (...args) => {
      // Log de todas las peticiones para depuración
      console.log("Supabase fetch:", args[0])
      return fetch(...args)
    },
  },
})

// Verificar la conexión al inicializar
supabase
  .from("data_users")
  .select("count")
  .then(({ data, error }) => {
    if (error) {
      console.error("Error al conectar con Supabase:", error)
    } else {
      console.log("Conexión con Supabase establecida. Recuento de registros:", data)
    }
  })
