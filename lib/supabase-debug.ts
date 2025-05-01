import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://hfkbmemelekyufpmbrho.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhma2JtZW1lbGVreXVmcG1icmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjkxNzMsImV4cCI6MjA2MDMwNTE3M30.y5gWI-z6y7DD1U1NrkrNEVkEyreelpL3yjMdhRA9XIo"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para verificar la conexión y listar tablas
export async function verifySupabaseConnection() {
  try {
    // Verificar la conexión
    const { data: authData, error: authError } = await supabase.auth.getSession()

    if (authError) {
      console.error("Error al conectar con Supabase Auth:", authError)
      return { success: false, error: authError }
    }

    console.log("Conexión con Supabase Auth establecida correctamente")

    // Intentar listar todas las tablas disponibles
    const { data, error } = await supabase.from("data_users").select("*").limit(10)

    if (error) {
      console.error("Error al consultar la tabla data_users:", error)
      return { success: false, error }
    }

    console.log("Datos recuperados correctamente:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado al verificar la conexión:", error)
    return { success: false, error }
  }
}
