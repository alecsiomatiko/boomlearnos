import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import bcrypt from 'bcrypt'

interface RegisterRequestData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  businessType?: string;
  position?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    console.log('🔍 [BACKEND DEBUG] Datos recibidos:', userData)

    // Validación de campos requeridos
    const requiredFields = ['email', 'password', 'firstName', 'lastName']
    const missingFields = requiredFields.filter(field => !userData[field])

    if (missingFields.length > 0) {
      console.log('❌ [BACKEND DEBUG] Faltan campos requeridos:', missingFields)
      return NextResponse.json({
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json({
        success: false,
        error: 'Email inválido'
      }, { status: 400 })
    }

    // Validación de contraseña
    if (userData.password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      }, { status: 400 })
    }
    
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    console.log('🔍 [BACKEND DEBUG] Contraseña hasheada exitosamente')

    // Verificar si el email ya existe
    const existingUser = await executeQuery('SELECT email FROM users WHERE email = ?', [userData.email])
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      console.log('❌ [BACKEND DEBUG] Email ya registrado:', userData.email)
      return NextResponse.json({
        success: false,
        error: 'El email ya está registrado'
      }, { status: 400 })
    }

    const result: any = await executeQuery(`
      INSERT INTO users (
        email, 
        password,
        name,
        first_name,
        last_name, 
        phone,
        city,
        business_type,
        position,
        role, 
        level,
        total_gems,
        current_streak,
        longest_streak,
        energy,
        onboarding_step,
        onboarding_completed,
        can_access_dashboard
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userData.email,
      hashedPassword,
      `${userData.firstName} ${userData.lastName}`,
      userData.firstName,
      userData.lastName,
      userData.phone || null,
      userData.city || null,
      userData.businessType || null,
      userData.position || null,
      'user',
      1,
      0,
      0,
      0,
      100,
      1, // onboarding_step: 1 (identidad organizacional)
      false, // onboarding_completed
      false // can_access_dashboard
    ])

    console.log('🔍 [BACKEND DEBUG] Resultado de inserción:', result)
    
    // Para tablas con UUID, verificamos affectedRows en lugar de insertId
    if (result.affectedRows > 0) {
      console.log('✅ [BACKEND DEBUG] Usuario insertado exitosamente, obteniendo datos...')
      
      // Obtener el usuario recién creado usando el email ya que es único
      const newUser = await executeQuery('SELECT * FROM users WHERE email = ?', [userData.email]) as any[];
      
      if (newUser && newUser.length > 0) {
        const user = newUser[0];
        const userResponse = {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            level: user.level.toString(),
            total_gems: user.total_gems || 0,
            onboardingStep: user.onboarding_step,
            onboardingCompleted: user.onboarding_completed,
            canAccessDashboard: user.can_access_dashboard,
            badges: [],
          }
        }
        console.log('✅ [BACKEND DEBUG] Enviando respuesta exitosa:', userResponse)
        return NextResponse.json(userResponse)
      } else {
        console.log('❌ [BACKEND DEBUG] No se pudo obtener el usuario recién creado')
      }
    } else {
      console.log('❌ [BACKEND DEBUG] No se insertaron filas, affectedRows:', result.affectedRows)
    }
    return NextResponse.json({ success: false, error: "No se pudo registrar el usuario" }, { status: 400 })
  } catch (error) {
    console.error('❌ [BACKEND DEBUG] Error en registro:', error)
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 })
  }
}