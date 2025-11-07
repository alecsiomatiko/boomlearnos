/**
 * Contexto de Autenticación
 * 
 * Maneja todo lo relacionado con el usuario logueado:
 * - Login/Logout
 * - Registro de nuevos usuarios
 * - Persistencia de sesión en localStorage
 * - Refresh automático de datos del perfil
 * 
 * El usuario se guarda en localStorage como "auth_user" y el token JWT
 * se guarda como "auth_token". Al cargar la app, si hay sesión guardada,
 * automáticamente hace un refresh para traer datos actualizados del servidor
 * (gemas, badges, etc.).
 */

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authenticateUser, registerUser } from "@/services/user-service"
import type { AuthUser, RegisterData } from "@/types/user"

/**
 * Tipo del contexto de autenticación
 * 
 * @property user - Usuario actual logueado (null si no hay sesión)
 * @property login - Función para iniciar sesión (retorna true si jaló)
 * @property register - Función para registrar nuevo usuario (retorna true si jaló)
 * @property logout - Limpia la sesión y redirecciona al login
 * @property updateUser - Actualiza datos del usuario (sync con localStorage)
 * @property isLoading - true mientras se verifica/carga la sesión
 * @property loading - Alias de isLoading (para compatibilidad)
 */
interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<AuthUser>) => void
  isLoading: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Hook para acceder al contexto de autenticación
 * 
 * Solo funciona dentro de componentes envueltos en <AuthProvider>
 * Si lo usas fuera, truena con error.
 * 
 * Ejemplo:
 * ```tsx
 * const { user, login, logout } = useAuth();
 * 
 * if (!user) {
 *   return <div>No estás logueado</div>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Provider del contexto de autenticación
 * 
 * Debe envolver toda la app (generalmente en el layout.tsx principal).
 * 
 * Al montar:
 * 1. Checa si hay sesión en localStorage
 * 2. Si hay, la restaura
 * 3. Hace un refresh automático para traer datos frescos del servidor
 * 
 * Al hacer login/register:
 * 1. Llama al API
 * 2. Guarda el usuario y token en localStorage
 * 3. Actualiza el estado
 * 
 * Al hacer logout:
 * 1. Limpia localStorage
 * 2. Limpia el estado
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Refresca los datos del usuario desde el servidor
   * 
   * Útil para obtener datos actualizados sin recargar la página
   * (gemas ganadas, nuevos badges, cambios en la org, etc.)
   */
  const refreshUserProfile = async (userId: string) => {
    try {
      console.log('🔄 [AUTH] Refrescando perfil del usuario:', userId);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ [AUTH] No hay token disponible');
        return;
      }

      console.log('🔄 [AUTH] Token encontrado, haciendo fetch...');
      const response = await fetch(`/api/user/profile?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔄 [AUTH] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AUTH] Datos recibidos:', data);
        console.log('✅ [AUTH] data.success:', data.success);
        console.log('✅ [AUTH] data.profile:', data.profile);
        console.log('✅ [AUTH] data.profile?.totalGems:', data.profile?.totalGems);
        
        if (data.success && data.profile) {
          const updatedUser = {
            ...user,
            id: userId,
            email: data.profile.email,
            name: `${data.profile.firstName} ${data.profile.lastName}`,
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            role: data.profile.role,
            total_gems: data.profile.totalGems,
            level: data.profile.level || '1',
            badges: [],
            organization: data.profile.organization,
            organization_id: data.profile.organization?.id, // ✅ Agregar organization_id
            current_organization_id: data.profile.organization?.id, // ✅ Agregar current_organization_id
            first_login: data.profile.first_login
          } as AuthUser;
          
          console.log('✅ [AUTH] Usuario actualizado con gemas:', updatedUser.total_gems);
          console.log('✅ [AUTH] Organization ID:', updatedUser.organization_id);
          console.log('✅ [AUTH] first_login:', updatedUser.first_login);
          setUser(updatedUser);
          localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        } else {
          console.log('❌ [AUTH] Estructura de datos incorrecta');
        }
      } else {
        console.error('❌ [AUTH] Error al refrescar:', response.status, await response.text());
      }
    } catch (error) {
      console.error("❌ [AUTH] Error refreshing user profile:", error);
    }
  };

  useEffect(() => {
    console.log('[AUTH] useEffect ejecutándose...');
    // Check for existing session
    const savedUser = localStorage.getItem("auth_user")
    console.log('[AUTH] savedUser en localStorage:', savedUser ? 'Sí' : 'No');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('[AUTH] Usuario parseado:', parsedUser.email, 'Gemas:', parsedUser.total_gems);
        setUser(parsedUser);
        
        // REFRESCAR DATOS DEL SERVIDOR al cargar
        if (parsedUser.id) {
          console.log('[AUTH] Llamando a refreshUserProfile...');
          refreshUserProfile(parsedUser.id);
        }
      } catch (error) {
        console.error("[AUTH] Error parsing saved user:", error)
        localStorage.removeItem("auth_user")
      }
    } else {
      console.log('[AUTH] No hay usuario guardado');
    }
    setIsLoading(false)
  }, [])

  /**
   * Iniciar sesión
   * 
   * Autentica al usuario con email y password.
   * Si las credenciales son correctas, guarda el usuario
   * y el token en localStorage.
   * 
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano (se hashea en el backend)
   * @returns true si el login fue exitoso, false si falló
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const authenticatedUser = await authenticateUser(email, password)

      if (authenticatedUser) {
        setUser(authenticatedUser)
        localStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Registrar nuevo usuario
   * 
   * Crea una cuenta nueva y automáticamente inicia sesión.
   * El usuario debe proporcionar un código de acceso válido.
   * 
   * @param userData - Datos del registro (email, password, nombre, código de acceso, etc.)
   * @returns true si el registro fue exitoso, false si falló
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('[AUTH CONTEXT] Iniciando registro con datos:', userData)
      setIsLoading(true)
      const newUser = await registerUser(userData)
      console.log('[AUTH CONTEXT] Respuesta de registerUser:', newUser)

      if (newUser) {
        console.log('[AUTH CONTEXT] Usuario registrado exitosamente, configurando sesión...')
        
        // LIMPIAR SESIÓN ANTERIOR
        console.log('[AUTH CONTEXT] Limpiando sesión anterior...')
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_token")
        
        // ESPERAR UN MOMENTO PARA QUE SE LIMPIE
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // ESTABLECER NUEVA SESIÓN
        setUser(newUser)
        localStorage.setItem("auth_user", JSON.stringify(newUser))
        
        // VERIFICAR TOKEN
        const savedToken = localStorage.getItem('auth_token')
        console.log('[AUTH CONTEXT] Token después del registro:', savedToken ? 'EXISTE' : 'NO EXISTE')
        console.log('[AUTH CONTEXT] Usuario establecido:', newUser.id, newUser.email)
        
        // NO RECARGAR - DEJAR QUE LA PÁGINA MANEJE LA REDIRECCIÓN
        console.log('[AUTH CONTEXT] Sesión configurada, listo para redirección')
        
        return true
      }

      console.log('[AUTH CONTEXT] newUser es null, registro falló')
      return false
    } catch (error) {
      console.error("[AUTH CONTEXT] Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Cerrar sesión
   * 
   * Limpia el usuario y el token de localStorage y el estado.
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token") // ELIMINAR TOKEN
  }

  /**
   * Actualizar datos del usuario
   * 
   * Permite actualizar parcialmente los datos del usuario
   * (por ejemplo, después de cambiar el perfil o ganar gemas).
   * Los cambios se sincronizan con localStorage.
   * 
   * @param userData - Datos parciales a actualizar
   */
  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      console.log('[AUTH CONTEXT] Updating user:', updatedUser)
      setUser(updatedUser)
      localStorage.setItem("auth_user", JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    loading: isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
