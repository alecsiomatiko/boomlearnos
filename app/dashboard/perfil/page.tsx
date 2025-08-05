"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Eye, Shield, Users, Settings } from 'lucide-react'

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState("cuenta")

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white rounded-lg p-1 shadow-sm">
            <TabsTrigger 
              value="cuenta" 
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Cuenta
            </TabsTrigger>
            <TabsTrigger 
              value="apariencia"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Apariencia
            </TabsTrigger>
            <TabsTrigger 
              value="notificaciones"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Notificaciones
            </TabsTrigger>
            <TabsTrigger 
              value="privacidad"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Privacidad
            </TabsTrigger>
            <TabsTrigger 
              value="referidos"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Referidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cuenta" className="space-y-6">
            {/* Información de Perfil */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Información de Perfil</h2>
                    
                    <div className="flex gap-8">
                      {/* Avatar y botón cambiar */}
                      <div className="flex flex-col items-center space-y-3">
                        <Avatar className="h-16 w-16 bg-gray-800">
                          <AvatarImage src="/placeholder.svg?height=64&width=64&text=JP" alt="Juan Pablo" />
                          <AvatarFallback className="bg-gray-800 text-white font-bold text-xl">JP</AvatarFallback>
                        </Avatar>
                        <Button 
                          size="sm" 
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-medium"
                        >
                          Cambiar avatar
                        </Button>
                      </div>

                      {/* Formulario */}
                      <div className="flex-1 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Nombre</label>
                          <Input 
                            placeholder="Nombre" 
                            className="bg-gray-100 border-0 rounded-lg h-12 text-gray-500"
                            defaultValue=""
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Número</label>
                          <Input 
                            placeholder="Número" 
                            className="bg-gray-100 border-0 rounded-lg h-12 text-gray-500"
                            defaultValue=""
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Empresa</label>
                          <Input 
                            placeholder="Empresa" 
                            className="bg-gray-100 border-0 rounded-lg h-12 text-gray-500"
                            defaultValue=""
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Correo</label>
                          <Input 
                            placeholder="Correo" 
                            className="bg-gray-100 border-0 rounded-lg h-12 text-gray-500"
                            defaultValue=""
                          />
                        </div>
                        
                        <div className="space-y-2 col-span-2">
                          <label className="text-sm font-medium text-gray-900">Cargo</label>
                          <Input 
                            placeholder="Cargo" 
                            className="bg-gray-100 border-0 rounded-lg h-12 text-gray-500"
                            defaultValue=""
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium">
                        Guardar cambios
                      </Button>
                    </div>
                  </div>

                  {/* Mascota */}
                  <div className="ml-8">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Artboard%2091-F6UUQN5pxrRHBj70oDTFTEeO84aFpV.png"
                      alt="Mascota León"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zona de Peligro */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Zona de Peligro</h2>
                <p className="text-gray-900 font-medium mb-2">Eliminar tu cuenta.</p>
                <p className="text-gray-500 text-sm mb-6">Esta acción eliminará permanentemente tu cuenta y todos tus datos.</p>
                <Button 
                  variant="destructive" 
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Eliminar cuenta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apariencia" className="space-y-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Apariencia</h2>
                <p className="text-gray-600">Personaliza la apariencia de tu interfaz.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificaciones" className="space-y-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Notificaciones</h2>
                <p className="text-gray-600">Gestiona cómo y cuándo recibir notificaciones.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacidad" className="space-y-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Privacidad</h2>
                <p className="text-gray-600">Controla tu privacidad y seguridad.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referidos" className="space-y-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Programa de Referidos</h2>
                <p className="text-gray-600">Invita amigos y obtén recompensas.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
