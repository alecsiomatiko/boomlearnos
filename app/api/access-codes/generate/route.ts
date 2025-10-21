import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/server/mysql"

const GENERATOR_PASSWORD = "Kalabasboomcodigos20182417"

// Función para generar código de 5 letras + 4 números
function generateAccessCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  
  let code = ""
  
  // 5 letras
  for (let i = 0; i < 5; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  
  // 4 números
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Verificar password
    if (password !== GENERATOR_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      )
    }

    // Generar código único
    let code: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    do {
      code = generateAccessCode()
      attempts++

      // Verificar si ya existe en la base de datos
      const existingCode = await executeQuery(
        "SELECT id FROM access_codes WHERE code = ?",
        [code]
      ) as any[]

      if (existingCode.length === 0) {
        isUnique = true
      }

      if (attempts >= maxAttempts) {
        throw new Error("No se pudo generar un código único después de varios intentos")
      }
    } while (!isUnique)

    // Insertar el nuevo código en la base de datos
    const result = await executeQuery(
      "INSERT INTO access_codes (code) VALUES (?)",
      [code]
    ) as any

    return NextResponse.json({
      code,
      created_at: new Date().toISOString(),
      message: "Código generado exitosamente"
    })

  } catch (error) {
    console.error("Error generando código de acceso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}