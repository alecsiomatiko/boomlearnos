import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/server/mysql"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Código de acceso requerido" },
        { status: 400 }
      )
    }

    // Verificar si el código existe y no ha sido usado
    const codeResult = await executeQuery(
      "SELECT id, is_used, used_by_user_id FROM access_codes WHERE code = ?",
      [code.toUpperCase()]
    ) as any[]

    if (codeResult.length === 0) {
      return NextResponse.json(
        { error: "Código de acceso inválido" },
        { status: 404 }
      )
    }

    const accessCode = codeResult[0]

    if (accessCode.is_used) {
      return NextResponse.json(
        { error: "Este código ya ha sido utilizado" },
        { status: 409 }
      )
    }

    return NextResponse.json({
      valid: true,
      message: "Código válido, puedes proceder con el registro"
    })

  } catch (error) {
    console.error("Error validando código de acceso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Función para marcar un código como usado (se llamará desde el registro)
export async function markCodeAsUsed(code: string, userId: number) {
  try {
    await executeQuery(
      "UPDATE access_codes SET is_used = TRUE, used_by_user_id = ?, used_at = NOW() WHERE code = ?",
      [userId, code.toUpperCase()]
    )
    return true
  } catch (error) {
    console.error("Error marcando código como usado:", error)
    return false
  }
}