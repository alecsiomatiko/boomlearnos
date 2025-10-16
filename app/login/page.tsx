"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        // Verificar si el usuario necesita cambiar contraseña
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          if (user.first_login === true) {
            // Redirigir a cambio de contraseña obligatorio
            toast({
              title: "Cambio de contraseña requerido",
              description: "Por seguridad, debes cambiar tu contraseña temporal.",
            })
            router.push("/change-password")
            return;
          }
        }

        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Has iniciado sesión correctamente.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Las credenciales son incorrectas. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Error de inicio de sesión",
        description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center justify-center gap-px">
          {/* Left side - Mascot */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <Image
                src="/images/mascot-login.png"
                alt="Kalabasboom Mascot"
                width={320}
                height={320}
                className="max-w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl -ml-6">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-white text-2xl font-bold mb-2">kalabasboom</h1>
                  <p className="text-gray-400 text-sm">ingresa a tu cuenta</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-white text-sm font-medium">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-gray-600 rounded-none px-0 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-white text-sm font-medium">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        placeholder="Contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-gray-600 rounded-none px-0 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-0 text-base pr-32"
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-3 text-red-500 text-xs hover:text-red-400 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 rounded-xl transition-colors text-base disabled:opacity-50"
                    >
                      {isLoading ? "Iniciando..." : "Iniciar sesión"}
                    </button>
                  </div>
                </form>

                {/* Register Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-400 text-sm">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/register" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                      Regístrate
                    </Link>
                  </p>
                </div>

                {/* Divider */}
                <div className="my-6">
                  <div className="border-t border-gray-700"></div>
                </div>

                {/* Social Login */}
                <div className="flex justify-center space-x-6">
                  <button
                    type="button"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-red-600/30 bg-red-600/10">
        <div className="flex justify-between items-center px-8 py-4 text-white text-sm">
          <span>©2025 KALABASBOOM</span>
          <div className="flex space-x-8">
            <Link href="#" className="hover:text-red-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-red-300 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
