import type { AuthUser, RegisterData } from "@/types/user"

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success) {
      return data.user
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function registerUser(userData: RegisterData): Promise<AuthUser | null> {
  try {
    console.log('🔍 [USER SERVICE] Enviando solicitud de registro:', { ...userData, password: '[REDACTED]' })

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    console.log('🔍 [USER SERVICE] Status de respuesta:', response.status)
    console.log('🔍 [USER SERVICE] Headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('🔍 [USER SERVICE] Datos de respuesta:', data)

    // Verificación más estricta de la respuesta
    if (!data) {
      console.log('❌ [USER SERVICE] No se recibieron datos del backend')
      return null
    }

    if (typeof data.success !== 'boolean') {
      console.log('❌ [USER SERVICE] La respuesta no contiene el campo success')
      return null
    }

    if (!data.success) {
      console.log('❌ [USER SERVICE] El backend indicó que el registro falló:', data.error || 'Sin mensaje de error')
      return null
    }

    if (!data.user) {
      console.log('❌ [USER SERVICE] La respuesta no contiene datos del usuario')
      return null
    }

    // Verificar que el usuario tenga los campos mínimos requeridos
    const requiredFields = ['id', 'email', 'name']
    const missingFields = requiredFields.filter(field => !(field in data.user))

    if (missingFields.length > 0) {
      console.log('❌ [USER SERVICE] Faltan campos requeridos en el usuario:', missingFields)
      return null
    }

    console.log('✅ [USER SERVICE] Usuario registrado exitosamente con datos completos:', data.user)
    return data.user
  } catch (error) {
    console.error('❌ [USER SERVICE] Error registering user:', error)
    return null
  }
}
