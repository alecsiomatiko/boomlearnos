import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/server/mysql"

const GENERATOR_PASSWORD = "Kalabasboomcodigos20182417"

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

    // Obtener todos los códigos con información del usuario que los usó
    const codes = await executeQuery(`
      SELECT 
        ac.id,
        ac.code,
        ac.is_used,
        ac.created_at,
        ac.used_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        o.name as organization_name
      FROM access_codes ac
      LEFT JOIN users u ON ac.used_by_user_id = u.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      ORDER BY ac.created_at DESC
    `, []) as any[]

    const formattedCodes = codes.map(code => ({
      id: code.id,
      code: code.code,
      isUsed: code.is_used,
      createdAt: code.created_at,
      usedAt: code.used_at,
      userInfo: code.is_used ? {
        name: `${code.first_name || ''} ${code.last_name || ''}`.trim(),
        email: code.email,
        phone: code.phone,
        organizationName: code.organization_name
      } : null
    }))

    return NextResponse.json({
      codes: formattedCodes,
      summary: {
        total: codes.length,
        used: codes.filter(c => c.is_used).length,
        available: codes.filter(c => !c.is_used).length
      }
    })

  } catch (error) {
    console.error("Error obteniendo historial de códigos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}