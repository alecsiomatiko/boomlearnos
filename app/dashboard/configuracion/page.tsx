"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Palette, Database, Key, Mail, Globe, Smartphone, Monitor } from "lucide-react"

export default function ConfiguracionPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    desktop: true,
  })

  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("es")

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h1>
          <p className="text-gray-600">Personaliza tu experiencia y gestiona tu cuenta</p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="text-gray-700">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-gray-700">
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="text-gray-700">
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-gray-700">
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-gray-700">
              Integraciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Actualiza tu información personal y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">
                      Nombre
                    </Label>
                    <Input id="firstName" defaultValue="Juan Pablo" className="text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">
                      Apellido
                    </Label>
                    <Input id="lastName" defaultValue="Administrador" className="text-gray-900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Correo Electrónico
                  </Label>
                  <Input id="email" type="email" defaultValue="juan.pablo@kalabasboom.com" className="text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Teléfono
                  </Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700">
                    Empresa
                  </Label>
                  <Input id="company" defaultValue="KalabasBoom" className="text-gray-900" />
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white">Guardar Cambios</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferencias de Notificaciones
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Controla cómo y cuándo recibes notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <Label className="text-gray-900">Notificaciones por Email</Label>
                    </div>
                    <p className="text-sm text-gray-600">Recibe actualizaciones importantes por correo</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-600" />
                      <Label className="text-gray-900">Notificaciones Push</Label>
                    </div>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tu dispositivo móvil</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-600" />
                      <Label className="text-gray-900">Notificaciones de Escritorio</Label>
                    </div>
                    <p className="text-sm text-gray-600">Recibe notificaciones en tu navegador</p>
                  </div>
                  <Switch
                    checked={notifications.desktop}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, desktop: checked })}
                  />
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white">Guardar Preferencias</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad de la Cuenta
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Gestiona la seguridad y privacidad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cambiar Contraseña</h4>
                    <div className="space-y-2">
                      <Input type="password" placeholder="Contraseña actual" className="text-gray-900" />
                      <Input type="password" placeholder="Nueva contraseña" className="text-gray-900" />
                      <Input type="password" placeholder="Confirmar nueva contraseña" className="text-gray-900" />
                    </div>
                    <Button className="mt-2 bg-red-500 hover:bg-red-600 text-white">Actualizar Contraseña</Button>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Autenticación de Dos Factores</h4>
                    <p className="text-sm text-gray-600 mb-4">Añade una capa extra de seguridad a tu cuenta</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500 text-white">Desactivado</Badge>
                      <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
                        Configurar 2FA
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sesiones Activas</h4>
                    <p className="text-sm text-gray-600 mb-4">Gestiona dónde has iniciado sesión</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Chrome en Windows</p>
                          <p className="text-sm text-gray-600">Última actividad: hace 2 minutos</p>
                        </div>
                        <Badge className="bg-green-500 text-white">Actual</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Safari en iPhone</p>
                          <p className="text-sm text-gray-600">Última actividad: hace 2 horas</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                          Cerrar Sesión
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apariencia y Personalización
                </CardTitle>
                <CardDescription className="text-gray-600">Personaliza la apariencia de tu interfaz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Tema</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        theme === "light" ? "border-red-500 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="w-full h-20 bg-white border rounded mb-2"></div>
                      <p className="text-sm font-medium text-gray-900">Claro</p>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        theme === "dark" ? "border-red-500 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="w-full h-20 bg-gray-800 border rounded mb-2"></div>
                      <p className="text-sm font-medium text-gray-900">Oscuro</p>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        theme === "auto" ? "border-red-500 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => setTheme("auto")}
                    >
                      <div className="w-full h-20 bg-gradient-to-r from-white to-gray-800 border rounded mb-2"></div>
                      <p className="text-sm font-medium text-gray-900">Automático</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Idioma</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer flex items-center gap-3 ${
                        language === "es" ? "border-red-500 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => setLanguage("es")}
                    >
                      <Globe className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-900">Español</span>
                    </div>
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer flex items-center gap-3 ${
                        language === "en" ? "border-red-500 bg-red-50" : "border-gray-200"
                      }`}
                      onClick={() => setLanguage("en")}
                    >
                      <Globe className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-900">English</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white">Aplicar Cambios</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Integraciones y APIs
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Conecta con servicios externos y gestiona tus APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">OpenAI API</h4>
                        <p className="text-sm text-gray-600">Integración con servicios de IA</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">Conectado</Badge>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                        Configurar
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Supabase</h4>
                        <p className="text-sm text-gray-600">Base de datos y autenticación</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">Conectado</Badge>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                        Configurar
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">SendGrid</h4>
                        <p className="text-sm text-gray-600">Servicio de correo electrónico</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-500 text-white">Desconectado</Badge>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-transparent">
                        Conectar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
