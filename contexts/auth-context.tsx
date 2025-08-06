"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authenticateUser, registerUser } from "@/services/user-service"
import type { AuthUser, RegisterData } from "@/types/user"

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
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

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("auth_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("auth_user")
      }
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
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
