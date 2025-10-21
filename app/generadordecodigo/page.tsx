"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lock, Key, Copy, RefreshCw, History, Users, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const GENERATOR_PASSWORD = "Kalabasboomcodigos20182417"

interface GeneratedCode {
  code: string
  created_at: string
}

interface CodeHistoryItem {
  id: number
  code: string
  isUsed: boolean
  createdAt: string
  usedAt: string | null
  userInfo: {
    name: string
    email: string
    phone: string
    organizationName: string
  } | null
}

interface HistorySummary {
  total: number
  used: number
  available: number
}

export default function GeneradorDeCodigo() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([])
  const [codeHistory, setCodeHistory] = useState<CodeHistoryItem[]>([])
  const [historySummary, setHistorySummary] = useState<HistorySummary | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { toast } = useToast()

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === GENERATOR_PASSWORD) {
      setIsAuthenticated(true)
      loadHistory() // Cargar historial al autenticarse
      toast({
        title: "✅ Acceso autorizado",
        description: "Puedes generar códigos de acceso",
      })
    } else {
      toast({
        variant: "destructive",
        title: "❌ Contraseña incorrecta",
        description: "El password ingresado no es válido",
      })
    }
  }

  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch("/api/access-codes/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: GENERATOR_PASSWORD }),
      })

      if (response.ok) {
        const data = await response.json()
        setCodeHistory(data.codes)
        setHistorySummary(data.summary)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el historial",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar historial",
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const generateAccessCode = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/access-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: GENERATOR_PASSWORD }),
      })

      if (!response.ok) {
        throw new Error("Error al generar código")
      }

      const data = await response.json()
      setGeneratedCodes(prev => [data, ...prev])
      loadHistory() // Recargar historial después de generar
      
      toast({
        title: "✅ Código generado",
        description: `Nuevo código: ${data.code}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el código de acceso",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "📋 Copiado",
      description: `Código ${code} copiado al portapapeles`,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-red via-brand-red/90 to-brand-dark flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/10">
              <Lock className="h-8 w-8 text-brand-red" />
            </div>
            <CardTitle className="text-2xl font-bold">Acceso Restringido</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ingresa la contraseña para acceder al generador de códigos
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-brand-red hover:bg-brand-red/90">
                <Lock className="mr-2 h-4 w-4" />
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red via-brand-red/90 to-brand-dark p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Key className="h-6 w-6 text-brand-red" />
                  Generador de Códigos de Acceso
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Genera códigos únicos para habilitar el registro de nuevos usuarios
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Autenticado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={generateAccessCode} 
                  disabled={isGenerating}
                  className="bg-brand-red hover:bg-brand-red/90"
                  size="lg"
                >
                  {isGenerating ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? "Generando..." : "Generar Nuevo Código"}
                </Button>

                <Button 
                  onClick={() => setShowHistory(!showHistory)} 
                  variant="outline"
                  size="lg"
                >
                  <History className="mr-2 h-4 w-4" />
                  {showHistory ? "Ocultar Historial" : "Ver Historial"}
                </Button>
              </div>

              {historySummary && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{historySummary.total}</div>
                    <div className="text-sm text-gray-600">Total Códigos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{historySummary.used}</div>
                    <div className="text-sm text-gray-600">Usados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{historySummary.available}</div>
                    <div className="text-sm text-gray-600">Disponibles</div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Los códigos generados tendrán formato: 5 letras + 4 números (ej: ALPHA1234)
              </p>
            </div>
          </CardContent>
        </Card>

        {generatedCodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Códigos Generados Recientemente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedCodes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <code className="text-lg font-mono font-bold text-brand-red">
                        {item.code}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Generado: {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showHistory && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-red" />
                Historial Completo de Códigos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando historial...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Código</th>
                        <th className="text-left p-2 font-semibold">Estado</th>
                        <th className="text-left p-2 font-semibold">Usuario</th>
                        <th className="text-left p-2 font-semibold">Empresa</th>
                        <th className="text-left p-2 font-semibold">Contacto</th>
                        <th className="text-left p-2 font-semibold">Fechas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codeHistory.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <code className="font-mono font-bold text-brand-red bg-gray-100 px-2 py-1 rounded">
                              {item.code}
                            </code>
                          </td>
                          <td className="p-2">
                            {item.isUsed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Usado
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Disponible
                              </Badge>
                            )}
                          </td>
                          <td className="p-2">
                            {item.userInfo ? (
                              <div>
                                <div className="font-medium">{item.userInfo.name}</div>
                                <div className="text-sm text-gray-500">{item.userInfo.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            {item.userInfo?.organizationName ? (
                              <span className="font-medium">{item.userInfo.organizationName}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            {item.userInfo?.phone ? (
                              <span className="text-sm">{item.userInfo.phone}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="text-xs space-y-1">
                              <div>
                                <span className="font-medium">Creado:</span><br />
                                {new Date(item.createdAt).toLocaleString()}
                              </div>
                              {item.usedAt && (
                                <div>
                                  <span className="font-medium">Usado:</span><br />
                                  {new Date(item.usedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {codeHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay códigos en el historial
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">⚠️ Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-700 space-y-2">
            <p>• Cada código solo puede ser usado UNA vez para registro</p>
            <p>• Los códigos tienen formato: 5 letras mayúsculas + 4 números</p>
            <p>• Una vez usado, el código se marca como "utilizado" en la base de datos</p>
            <p>• Comparte estos códigos solo con personas autorizadas para registrarse</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}