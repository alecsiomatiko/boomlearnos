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
    name: "",
    email: "",
    phone: "",
    city: "",
    businessType: "",
    password: "defaultPassword123", // Se generará automáticamente
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
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.businessType) {
      toast({
        title: "Error de registro",
        description: "Todos los campos son obligatorios.",
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
      const success = await register({
        ...formData,
        password: formData.password,
        confirmPassword: formData.password,
      })

      if (success) {
        toast({
          title: "¡Pre-registro exitoso!",
          description: "Tu cuenta de founder ha sido creada correctamente.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error de registro",
          description: "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Registration error:", error)
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
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-gray-800 text-sm font-medium">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Nombre"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 rounded-none px-0 py-3 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-0 text-base"
                />
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
