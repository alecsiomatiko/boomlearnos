"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authenticateUser, registerUser } from "@/services/user-service"
import type { AuthUser, RegisterData } from "@/types/user"

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para refrescar datos del usuario desde el servidor
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
            first_login: data.profile.first_login
          } as AuthUser;
          
          console.log('✅ [AUTH] Usuario actualizado con gemas:', updatedUser.total_gems);
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
    console.log('🚀 [AUTH] useEffect ejecutándose...');
    // Check for existing session
    const savedUser = localStorage.getItem("auth_user")
    console.log('🚀 [AUTH] savedUser en localStorage:', savedUser ? 'Sí' : 'No');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🚀 [AUTH] Usuario parseado:', parsedUser.email, 'Gemas:', parsedUser.total_gems);
        setUser(parsedUser);
        
        // 🔄 REFRESCAR DATOS DEL SERVIDOR al cargar
        if (parsedUser.id) {
          console.log('🔄 [AUTH] Llamando a refreshUserProfile...');
          refreshUserProfile(parsedUser.id);
        }
      } catch (error) {
        console.error("❌ [AUTH] Error parsing saved user:", error)
        localStorage.removeItem("auth_user")
      }
    } else {
      console.log('⚠️ [AUTH] No hay usuario guardado');
    }
    setIsLoading(false)
  }, [])

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

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('🔍 [AUTH CONTEXT] Iniciando registro con datos:', userData)
      setIsLoading(true)
      const newUser = await registerUser(userData)
      console.log('🔍 [AUTH CONTEXT] Respuesta de registerUser:', newUser)

      if (newUser) {
        console.log('✅ [AUTH CONTEXT] Usuario registrado exitosamente, guardando en localStorage')
        setUser(newUser)
        localStorage.setItem("auth_user", JSON.stringify(newUser))
        return true
      }

      console.log('❌ [AUTH CONTEXT] newUser es null, registro falló')
      return false
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token") // ✅ ELIMINAR TOKEN
  }

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
