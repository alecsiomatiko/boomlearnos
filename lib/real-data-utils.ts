// Utilidades para obtener datos reales de la base de datos (sin datos dummy)
import type { User } from "@/types/user"

// Función para obtener el usuario actual de la base de datos
export async function getCurrentUserFromDB(): Promise<User | null> {
  try {
    const response = await fetch('/api/user/profile')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    if (result.success && result.user) {
      // Mapear los datos de la base de datos al tipo User completo
      const dbUser = result.user
      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email,
        phone: dbUser.phone || '',
        city: dbUser.city || '',
        business_type: dbUser.business_type || '',
        role: dbUser.role || 'user',
        level: 'Principiante', // Valor por defecto
        total_gems: 0, // Valor por defecto
        current_streak: 0, // Valor por defecto
        longest_streak: 0, // Valor por defecto
        energy: 100, // Valor por defecto
        last_checkin: dbUser.last_checkin,
        badges: [], // Array vacío por defecto
        created_at: dbUser.created_at || new Date().toISOString(),
        updated_at: dbUser.updated_at || new Date().toISOString()
      }
      return user
    }
    return null
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }
}

// Función para obtener el estado del onboarding
export async function getOnboardingStatus(): Promise<{completed: boolean, data?: any}> {
  try {
    const response = await fetch('/api/diagnostics/overview')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    if (result.success && result.diagnostics) {
      return {
        completed: result.diagnostics.onboardingDiagnostic.completed,
        data: result.diagnostics.onboardingDiagnostic.answers
      }
    }
    return { completed: false }
  } catch (error) {
    console.error('Error obteniendo estado del onboarding:', error)
    return { completed: false }
  }
}

// Función para obtener módulos de diagnóstico
export async function getDiagnosticModules() {
  try {
    const response = await fetch('/api/diagnostic/modules')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    if (result.success && result.modules) {
      return result.modules
    }
    return []
  } catch (error) {
    console.error('Error obteniendo módulos de diagnóstico:', error)
    return []
  }
}

// Función simplificada para inicializar solo lo necesario
export async function initializeUserData(): Promise<User | null> {
  try {
    console.log('🔍 [REAL-DATA-UTILS] Iniciando inicialización de usuario...')
    
    // Verificar si estamos en el browser
    if (typeof window === "undefined") {
      console.log('❌ [REAL-DATA-UTILS] No estamos en el browser')
      return null
    }

    const user = await getCurrentUserFromDB()
    if (user) {
      console.log('✅ [REAL-DATA-UTILS] Usuario obtenido de la base de datos')
      // Guardar usuario en localStorage para sesión local
      try {
        localStorage.setItem('currentUser', JSON.stringify(user))
        console.log('✅ [REAL-DATA-UTILS] Usuario guardado en localStorage')
      } catch (storageError) {
        console.warn('⚠️ [REAL-DATA-UTILS] Error guardando en localStorage:', storageError)
      }
      return user
    } else {
      console.log('❌ [REAL-DATA-UTILS] No se pudo obtener usuario de la base de datos')
    }
    return null
  } catch (error) {
    console.error('❌ [REAL-DATA-UTILS] Error inicializando datos del usuario:', error)
    return null
  }
}

// Función para obtener usuario del localStorage o base de datos
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  
  const storedUser = localStorage.getItem('currentUser')
  if (storedUser) {
    try {
      return JSON.parse(storedUser)
    } catch (error) {
      console.error('Error parsing stored user:', error)
      localStorage.removeItem('currentUser')
    }
  }
  return null
}
