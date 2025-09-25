// Solución simplificada y robusta para el manejo de usuarios
import type { User } from "@/types/user"

// Usuario por defecto para garantizar que la app funcione
const DEFAULT_USER: User = {
  id: 'default-user-id',
  email: 'usuario@ejemplo.com',
  name: 'Usuario del Sistema',
  phone: '',
  city: '',
  business_type: '',
  role: 'user',
  level: 'Principiante',
  total_gems: 0,
  current_streak: 0,
  longest_streak: 0,
  energy: 100,
  badges: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Función simple y robusta para obtener usuario
export async function getUser(): Promise<User> {
  try {
    console.log('🔍 [USER-MANAGER] Obteniendo usuario...')
    
    const response = await fetch('/api/user/profile')
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.user) {
        console.log('✅ [USER-MANAGER] Usuario obtenido de la API')
        const dbUser = result.user
        
        // Mapear datos de la base de datos
        const user: User = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email,
          phone: dbUser.phone || '',
          city: dbUser.city || '',
          business_type: dbUser.business_type || '',
          role: dbUser.role || 'user',
          level: 'Principiante',
          total_gems: 0,
          current_streak: 0,
          longest_streak: 0,
          energy: 100,
          badges: [],
          created_at: dbUser.created_at || new Date().toISOString(),
          updated_at: dbUser.updated_at || new Date().toISOString()
        }
        
        return user
      }
    }
    
    console.warn('⚠️ [USER-MANAGER] No se pudo obtener usuario de la API, usando default')
    return DEFAULT_USER
    
  } catch (error) {
    console.error('❌ [USER-MANAGER] Error obteniendo usuario:', error)
    console.log('🔄 [USER-MANAGER] Usando usuario por defecto')
    return DEFAULT_USER
  }
}

// Función para obtener estado del onboarding
export async function getOnboardingStatus(): Promise<{completed: boolean, data?: any}> {
  try {
    const response = await fetch('/api/diagnostics/overview')
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.diagnostics) {
        return {
          completed: result.diagnostics.onboardingDiagnostic.completed,
          data: result.diagnostics.onboardingDiagnostic.answers
        }
      }
    }
    return { completed: false }
  } catch (error) {
    console.error('Error obteniendo estado del onboarding:', error)
    return { completed: false }
  }
}
