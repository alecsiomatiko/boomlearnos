"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    businessType: "",
    position: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city || !formData.businessType || !formData.position || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Error de registro",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error de registro",
        description: "Por favor ingresa un email válido.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 [REGISTER PAGE] Enviando datos de registro:', formData)
      const success = await register({
        ...formData,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })
      console.log('🔍 [REGISTER PAGE] Respuesta del registro:', success)

      if (success) {
        console.log('✅ [REGISTER PAGE] Registro exitoso, redirigiendo al onboarding...')
        toast({
          title: "¡Pre-registro exitoso!",
          description: "Tu cuenta de founder ha sido creada correctamente.",
        })
        router.push("/onboarding/identidad")
      } else {
        console.log('❌ [REGISTER PAGE] Registro falló, success es false')
        toast({
          title: "Error de registro",
          description: "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("❌ [REGISTER PAGE] Error en registro:", error)
      toast({
        title: "Error de registro",
        description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6 text-center">
            <h1 className="text-white text-xl font-bold">
              PRE-REGISTRO
            </h1>
            <h2 className="text-white text-xl font-bold">
              FOUNDERS<span className="text-red-500">.</span>
            </h2>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Nombres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-gray-800 text-sm font-medium">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Nombre"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-gray-800 text-sm font-medium">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Apellido"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-800 text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-gray-800 text-sm font-medium">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Teléfono"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <label htmlFor="city" className="block text-gray-800 text-sm font-medium">
                  Ciudad
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Ciudad"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Giro del Negocio */}
              <div className="space-y-2">
                <label htmlFor="businessType" className="block text-gray-800 text-sm font-medium">
                  Giro del Negocio
                </label>
                <input
                  id="businessType"
                  name="businessType"
                  type="text"
                  placeholder="Giro del Negocio"
                  required
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Posición */}
              <div className="space-y-2">
                <label htmlFor="position" className="block text-gray-800 text-sm font-medium">
                  Posición/Cargo
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="Ej: CEO, Gerente, Fundador"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-gray-800 text-sm font-medium">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-gray-800 text-sm font-medium">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar Contraseña"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
              </div>

              {/* Register Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-colors text-base disabled:opacity-50"
                >
                  {isLoading ? "REGISTRANDO..." : "REGISTRATE"}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
