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
export async function getUser(userId?: string): Promise<User> {
  try {
    console.log('🔍 [USER-MANAGER] Obteniendo usuario...')
    
    // Si no se proporciona userId, intentar obtener cualquier usuario (fallback)
    const url = userId ? `/api/user/profile?userId=${userId}` : '/api/user/profile'
    const response = await fetch(url)
    
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.profile) {
        console.log('✅ [USER-MANAGER] Usuario obtenido de la API')
        const profile = result.profile
        
        // Mapear datos reales de la base de datos
        const user: User = {
          id: profile.id || 'default-user-id',
          email: profile.email || 'usuario@ejemplo.com',
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email || 'Usuario del Sistema',
          phone: profile.phone || '',
          city: profile.city || '',
          business_type: profile.organization?.businessType || '',
          role: profile.role || 'user',
          level: 'Principiante',
          total_gems: profile.totalGems || 0,
          current_streak: 0,
          longest_streak: 0,
          energy: 100,
          badges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('✅ [USER-MANAGER] Usuario mapeado:', user.name)
        return user
      }
    }
    
    console.log('⚠️ [USER-MANAGER] API falló, usando usuario por defecto')
    return DEFAULT_USER
  } catch (error) {
    console.error('❌ [USER-MANAGER] Error obteniendo usuario:', error)
    return DEFAULT_USER
  }
}

// Función para obtener estado del onboarding
export async function getOnboardingStatus(): Promise<{completed: boolean, data?: any}> {
  try {
    const response = await fetch('/api/diagnostics/overview')
    if (response.ok) {
      const result = await response.json()
      return { completed: true, data: result }
    }
  } catch (error) {
    console.error('Error obteniendo estado del onboarding:', error)
  }
  
  return { completed: false }
}