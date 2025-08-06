import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    // Solo para pruebas, guarda la contraseña en texto plano
    const result: any = await executeQuery(`
      INSERT INTO users (
        email, 
        password,
        name, 
        role, 
        level, 
        total_gems
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userData.email,
      userData.password,
      userData.name,
      'user',
      1,
      0
    ])

    if (result.insertId) {
      return NextResponse.json({
        success: true,
        user: {
          id: result.insertId,
          email: userData.email,
          name: userData.name,
          role: 'user',
          level: 1,
          points: 0,
          badges: [],
        }
      })
    }
    return NextResponse.json({ success: false, error: "No se pudo registrar el usuario" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 })
  }
}