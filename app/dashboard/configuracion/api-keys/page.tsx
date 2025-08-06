"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, AlertCircle, Key, Lock, RefreshCw, Sparkles } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ConfettiExplosion } from "@/components/confetti-explosion"

export default function ApiKeysPage() {
  const [openaiKey, setOpenaiKey] = useState("")
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState("openai")

  useEffect(() => {
    // Intentar recuperar la clave de localStorage (solo para desarrollo)
    const storedKey = localStorage.getItem("OPENAI_API_KEY")
    if (storedKey) {
      setOpenaiKey(storedKey)
      setIsKeyValid(true)
    }
  }, [])

  const validateOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una API key",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)

    try {
      // Llamar a nuestro endpoint para validar la clave
      const response = await fetch("/api/validate-openai-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: openaiKey }),
      })

      const data = await response.json()

      if (data.valid) {
        setIsKeyValid(true)
        setShowConfetti(true)

        // Guardar en localStorage (solo para desarrollo)
        localStorage.setItem("OPENAI_API_KEY", openaiKey)

        toast({
          title: "¡API key válida!",
          description: "Tu clave de OpenAI ha sido validada y guardada correctamente.",
        })
      } else {
        setIsKeyValid(false)
        toast({
          title: "API key inválida",
          description: data.message || "La clave proporcionada no es válida.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating API key:", error)
      setIsKeyValid(false)
      toast({
        title: "Error",
        description: "Hubo un problema al validar la clave. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="container py-8">
      {showConfetti && (
        <ConfettiExplosion trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración de API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Configura las claves de API para habilitar funcionalidades avanzadas de IA en KALABASBOOM OS
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="other" disabled>
            Otras APIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="openai" className="mt-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <CardTitle>OpenAI API Key</CardTitle>
                </div>
                {isKeyValid && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Configurada
                  </Badge>
                )}
              </div>
              <CardDescription>
                Esta clave es necesaria para generar contenido personalizado con IA, como misión, visión, y
                recomendaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="openai-key" className="text-sm font-medium">
                      API Key de OpenAI
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="font-mono"
                    />
                    <Button
                      onClick={validateOpenAIKey}
                      disabled={isValidating || !openaiKey.trim()}
                      className="whitespace-nowrap"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        "Validar y Guardar"
                      )}
                    </Button>
                  </div>
                </div>

                {isKeyValid === true && (
                  <Alert className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>API Key válida</AlertTitle>
                    <AlertDescription>
                      Tu clave de OpenAI está configurada correctamente. Ahora puedes disfrutar de todas las
                      funcionalidades de IA.
                    </AlertDescription>
                  </Alert>
                )}

                {isKeyValid === false && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>API Key inválida</AlertTitle>
                    <AlertDescription>
                      La clave proporcionada no es válida o ha ocurrido un error al validarla. Por favor, verifica que
                      has copiado la clave correctamente.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">¿Dónde encontrar tu API Key?</h3>
                  </div>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                    <li>
                      Ve a{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        platform.openai.com/api-keys
                      </a>
                    </li>
                    <li>Inicia sesión en tu cuenta de OpenAI</li>
                    <li>Haz clic en "Create new secret key"</li>
                    <li>Copia la clave generada y pégala aquí</li>
                  </ol>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Tu API key se almacena de forma segura y nunca se comparte con terceros.
              </p>
              <p className="text-sm text-muted-foreground">
                El uso de la API de OpenAI puede generar costos según su política de precios.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Funcionalidades potenciadas por IA</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Generación de Identidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea automáticamente misión, visión y valores corporativos personalizados para tu empresa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Asistente Virtual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Obtén respuestas a tus preguntas y ayuda personalizada para usar la plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Análisis de Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recibe insights y recomendaciones basadas en tus datos de rendimiento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Generación de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea automáticamente tareas relevantes basadas en tus objetivos empresariales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
