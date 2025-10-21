import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback-secret-key';

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

    // Validación de campos requeridos (incluyendo accessCode)
    const requiredFields = ['accessCode', 'email', 'password', 'firstName', 'lastName']
    const missingFields = requiredFields.filter(field => !userData[field])

    if (missingFields.length > 0) {
      console.log('❌ [BACKEND DEBUG] Faltan campos requeridos:', missingFields)
      return NextResponse.json({
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Validar código de acceso PRIMERO
    const accessCodeCheck = await executeQuery(
      "SELECT id, is_used, used_by_user_id FROM access_codes WHERE code = ?",
      [userData.accessCode.toUpperCase()]
    ) as any[]

    if (accessCodeCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Código de acceso inválido'
      }, { status: 400 })
    }

    const accessCode = accessCodeCheck[0]
    if (accessCode.is_used) {
      return NextResponse.json({
        success: false,
        error: 'Este código de acceso ya ha sido utilizado'
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

    // 🔑 DETECTAR SI ES EL PRIMER USUARIO (ADMIN AUTOMÁTICO)
    console.log('🔍 [BACKEND DEBUG] Verificando si es el primer usuario...')
    const userCount: any = await executeQuery('SELECT COUNT(*) as total FROM users', [])
    const isFirstUser = Array.isArray(userCount) && userCount[0]?.total === 0
    
    // El primer usuario siempre es admin, otros pueden especificar rol
    let role = 'user' // default
    if (isFirstUser) {
      role = 'admin'
      console.log('👑 [BACKEND DEBUG] PRIMER USUARIO detectado - asignando rol ADMIN automáticamente')
    } else if (userData.role && (userData.role === 'admin' || userData.role === 'user')) {
      role = userData.role
      console.log('🔍 [BACKEND DEBUG] Rol especificado:', role)
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
        can_access_dashboard,
        first_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      role,
      1,
      0,
      0,
      0,
      100,
      1, // onboarding_step: 1 (identidad organizacional)
      false, // onboarding_completed
      false, // can_access_dashboard
      false // first_login: false para usuarios que se registran normalmente
    ]);

    console.log('🔍 [BACKEND DEBUG] Resultado de inserción:', result)
    
    // Para tablas con UUID, verificamos affectedRows en lugar de insertId
    if (result.affectedRows > 0) {
      console.log('✅ [BACKEND DEBUG] Usuario insertado exitosamente, obteniendo datos...')
      
      // Obtener el usuario recién creado usando el email ya que es único
      const newUserArr = await executeQuery('SELECT * FROM users WHERE email = ?', [userData.email]) as any[];
      if (newUserArr && newUserArr.length > 0) {
        const user = newUserArr[0];
        
        // Marcar el código de acceso como usado
        await executeQuery(
          "UPDATE access_codes SET is_used = TRUE, used_by_user_id = ?, used_at = NOW() WHERE code = ?",
          [user.id, userData.accessCode.toUpperCase()]
        )
        console.log('✅ [BACKEND DEBUG] Código de acceso marcado como usado')
        
        // Si es admin, crear organización automáticamente
        if (user.role === 'admin') {
          const orgName = userData.organizationName || `${user.first_name} ${user.last_name} Org`;
          await executeQuery(
            'INSERT INTO organizations (id, name, owner_user_id) VALUES (?, ?, ?)',
            [user.id, orgName, user.id]
          );
        }

        // ✅ GENERAR JWT TOKEN PARA AUTO-LOGIN
        const token = jwt.sign(
          { 
            sub: user.id,
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: null // Se establecerá después del onboarding
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        const userResponse = {
          success: true,
          token, // ✅ Incluir token para auto-login
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
        };
        console.log('✅ [BACKEND DEBUG] Enviando respuesta exitosa con token')
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