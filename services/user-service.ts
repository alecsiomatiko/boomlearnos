/**
 * Servicios de autenticación y registro de usuarios
 * 
 * Este archivo contiene las funciones para autenticar y registrar usuarios.
 * Se comunica con los endpoints de /api/auth y maneja:
 * - Login con email/password
 * - Registro de nuevos usuarios con código de acceso
 * - Guardado del token JWT en localStorage
 * - Normalización de organization_id (por inconsistencias en el backend)
 */

import type { AuthUser, RegisterData } from "@/types/user"

/**
 * Autenticar usuario con email y contraseña
 * 
 * Llama al endpoint /api/auth/login y si las credenciales son correctas,
 * guarda el token JWT en localStorage y retorna los datos del usuario.
 * 
 * El usuario retornado tiene normalizados los IDs de organización para
 * evitar problemas con las diferentes variantes que usa el backend
 * (organization_id, organizationId, current_organization_id).
 * 
 * @param email - Email del usuario
 * @param password - Contraseña en texto plano (se hashea en el backend)
 * @returns Datos del usuario autenticado o null si falla
 * 
 * Ejemplo:
 * ```tsx
 * const user = await authenticateUser('admin@ejemplo.com', 'password123');
 * if (user) {
 *   console.log('Login exitoso:', user.name);
 * }
 * ```
 */
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
      // GUARDAR TOKEN JWT
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      // ASEGURAR QUE EL USUARIO TENGA TODOS LOS IDs DE ORGANIZACIÓN
      // Normalizar porque el backend a veces usa diferentes nombres
      if (data.user) {
        const orgId = data.user.organizationId || data.user.organization_id || data.user.organization?.id;
        if (orgId) {
          data.user.organization_id = orgId;
          data.user.current_organization_id = orgId;
          data.user.organizationId = orgId;
        }
      }
      
      return data.user
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

/**
 * Registrar un nuevo usuario
 * 
 * Crea una cuenta nueva en el sistema. El usuario debe proporcionar
 * un código de acceso válido (generado por un admin). Después del
 * registro exitoso, automáticamente guarda el token JWT para que
 * el usuario quede logueado.
 * 
 * El flujo es:
 * 1. Valida el código de acceso
 * 2. Crea el usuario en la BD
 * 3. Genera token JWT
 * 4. Retorna usuario + token
 * 
 * @param userData - Datos del registro (email, password, nombre, código, etc.)
 * @returns Usuario creado o null si falla
 * 
 * Ejemplo:
 * ```tsx
 * const newUser = await registerUser({
 *   email: 'nuevo@empresa.com',
 *   password: 'pass123',
 *   firstName: 'Juan',
 *   lastName: 'Pérez',
 *   accessCode: 'DEMO2024'
 * });
 * ```
 */
export async function registerUser(userData: RegisterData): Promise<AuthUser | null> {
  try {
    console.log('[USER SERVICE] Enviando solicitud de registro:', { ...userData, password: '[REDACTED]' })

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    console.log('[USER SERVICE] Status de respuesta:', response.status)
    console.log('[USER SERVICE] Headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('[USER SERVICE] Datos de respuesta:', data)

    // Verificación estricta de la respuesta
    if (!data) {
      console.log('[USER SERVICE] No se recibieron datos del backend')
      return null
    }

    if (typeof data.success !== 'boolean') {
      console.log('[USER SERVICE] La respuesta no contiene el campo success')
      return null
    }

    if (!data.success) {
      console.log('[USER SERVICE] El backend indicó que el registro falló:', data.error || 'Sin mensaje de error')
      return null
    }

    if (!data.user) {
      console.log('[USER SERVICE] La respuesta no contiene datos del usuario')
      return null
    }

    // Verificar que el usuario tenga los campos mínimos requeridos
    const requiredFields = ['id', 'email', 'name']
    const missingFields = requiredFields.filter(field => !(field in data.user))

    if (missingFields.length > 0) {
      console.log('[USER SERVICE] Faltan campos requeridos en el usuario:', missingFields)
      return null
    }

    console.log('[USER SERVICE] Usuario registrado exitosamente con datos completos:', data.user)
    
    // GUARDAR TOKEN JWT PARA AUTO-LOGIN
    if (data.token) {
      console.log('[USER SERVICE] Guardando token de autenticación')
      localStorage.setItem('auth_token', data.token);
    } else {
      console.log('[USER SERVICE] No se recibió token en el registro')
    }
    
    // ASEGURAR QUE EL USUARIO TENGA TODOS LOS IDs DE ORGANIZACIÓN
    if (data.user) {
      const orgId = data.user.organizationId || data.user.organization_id || data.user.organization?.id;
      if (orgId) {
        data.user.organization_id = orgId;
        data.user.current_organization_id = orgId;
        data.user.organizationId = orgId;
      }
    }
    
    return data.user
  } catch (error) {
    console.error('[USER SERVICE] Error registering user:', error)
    return null
  }
}
