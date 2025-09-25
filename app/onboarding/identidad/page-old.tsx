"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle2,
  Edit,
  Rocket,
  Target,
  Heart,
  Zap,
  Shield,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ConfettiExplosion } from "@/components/confetti-explosion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TextImprover } from "@/components/text-improver"

// Valores corporativos predefinidos
const corporateValues = [
  {
    id: "innovation",
    name: "Innovación",
    icon: <Zap className="h-5 w-5" />,
    description: "Buscamos constantemente nuevas ideas y soluciones creativas.",
  },
  {
    id: "excellence",
    name: "Excelencia",
    icon: <Target className="h-5 w-5" />,
    description: "Nos esforzamos por alcanzar los más altos estándares en todo lo que hacemos.",
  },
  {
    id: "integrity",
    name: "Integridad",
    icon: <Shield className="h-5 w-5" />,
    description: "Actuamos con honestidad, transparencia y ética en todas nuestras interacciones.",
  },
  {
    id: "customer_focus",
    name: "Enfoque al Cliente",
    icon: <Heart className="h-5 w-5" />,
    description: "Ponemos a nuestros clientes en el centro de todas nuestras decisiones.",
  },
  {
    id: "teamwork",
    name: "Trabajo en Equipo",
    icon: <Rocket className="h-5 w-5" />,
    description: "Colaboramos efectivamente, aprovechando nuestras fortalezas colectivas.",
  },
]

// Estilos de avatar predefinidos
const avatarStyles = [
  { id: "rocket", name: "Cohete", icon: <Rocket className="h-10 w-10" />, color: "bg-primary text-primary-foreground" },
  { id: "target", name: "Diana", icon: <Target className="h-10 w-10" />, color: "bg-blue-500 text-white" },
  { id: "zap", name: "Rayo", icon: <Zap className="h-10 w-10" />, color: "bg-yellow-500 text-black" },
  { id: "shield", name: "Escudo", icon: <Shield className="h-10 w-10" />, color: "bg-green-500 text-white" },
  { id: "heart", name: "Corazón", icon: <Heart className="h-10 w-10" />, color: "bg-red-500 text-white" },
]

export default function IdentidadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("mision")

  const [mision, setMision] = useState("")
  const [vision, setVision] = useState("")
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [avatarStyle, setAvatarStyle] = useState("")
  const [tono, setTono] = useState("profesional")

  const [generatedMision, setGeneratedMision] = useState("")
  const [generatedVision, setGeneratedVision] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [confettiKey, setConfettiKey] = useState(0)
  const [completionStep, setCompletionStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  useEffect(() => {
    // Recuperar datos del usuario y resultados del diagnóstico
    const storedUser = localStorage.getItem("user")
    const storedResults = localStorage.getItem("diagnosticResults")

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Error parsing user data:", e)
        router.push("/register")
        return
      }
    } else {
      router.push("/register")
      return
    }

    if (storedResults) {
      try {
        setDiagnosticResults(JSON.parse(storedResults))
      } catch (e) {
        console.error("Error parsing diagnostic results:", e)
        router.push("/onboarding/diagnostico")
        return
      }
    } else {
      router.push("/onboarding/diagnostico")
      return
    }
  }, [router])

  useEffect(() => {
    // Generar misión y visión basadas en el usuario y diagnóstico
    if (user && diagnosticResults) {
      generateIdentityWithAI()
    }
  }, [user, diagnosticResults])

  const generateIdentityWithAI = async () => {
    if (!user || !diagnosticResults) return

    setIsGenerating(true)
    setError(null)
    setCompletionStep(0)
    setIsUsingFallback(false)

    try {
      // Obtener las respuestas del diagnóstico
      const answers = diagnosticResults.answers || {}

      // Preparar los datos para enviar a la API
      const requestData = {
        companyName: user.companyName || "Mi Empresa",
        businessType: answers.business_type || "Servicios",
        businessStage: answers.business_stage || "En crecimiento",
        targetAudience: answers.target_audience || "Clientes generales",
        uniqueValue: answers.unique_value || "Calidad y servicio",
        goals: answers.goals || "Crecimiento sostenible",
        challenges: answers.challenges || "Competencia del mercado",
        tono: tono,
      }

      console.log("📤 Enviando datos a API:", requestData)

      // Llamar a nuestra API
      const response = await fetch("/api/generate-identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("📥 Respuesta recibida, status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error de API:", errorText)
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Datos recibidos:", data)

      // Verificar si es fallback
      if (data.fallback) {
        setIsUsingFallback(true)
        console.log("⚠️ Usando identidad predeterminada")
      }

      // Actualizar el estado con los datos generados
      setGeneratedMision(data.mision || "")
      setGeneratedVision(data.vision || "")
      setMision(data.mision || "")
      setVision(data.vision || "")
      setSelectedValues(data.valores || ["innovation", "excellence", "customer_focus"])
      setAvatarStyle(data.avatarSugerido || "rocket")

      // Mostrar animación de generación por pasos
      showGenerationSteps()
    } catch (error: any) {
      console.error("❌ Error generando identidad:", error)
      setError(`Error al generar identidad: ${error.message}`)
      setIsGenerating(false)

      // En caso de error total, usar valores predeterminados
      const fallbackData = {
        mision: `${user.companyName || "Mi Empresa"} se dedica a ofrecer servicios de alta calidad, comprometidos con la excelencia y la satisfacción de nuestros clientes.`,
        vision: `Ser la empresa líder en nuestro sector, reconocida por nuestra calidad, innovación y compromiso con el crecimiento de nuestros clientes.`,
        valores: ["innovation", "excellence", "customer_focus"],
        avatarSugerido: "rocket",
      }

      setMision(fallbackData.mision)
      setVision(fallbackData.vision)
      setSelectedValues(fallbackData.valores)
      setAvatarStyle(fallbackData.avatarSugerido)
      setIsUsingFallback(true)
    }
  }

  const showGenerationSteps = () => {
    // Paso 1: Generar misión
    setCompletionStep(1)
    setTimeout(() => {
      setConfettiKey((prev) => prev + 1)

      // Paso 2: Generar visión
      setTimeout(() => {
        setCompletionStep(2)
        setTimeout(() => {
          setConfettiKey((prev) => prev + 1)

          // Paso 3: Generar valores y avatar
          setTimeout(() => {
            setCompletionStep(3)
            setTimeout(() => {
              setConfettiKey((prev) => prev + 1)
              setIsGenerating(false)
              setActiveTab("mision")
            }, 1000)
          }, 1500)
        }, 1000)
      }, 1500)
    }, 1500)
  }

  const handleValueToggle = (valueId: string) => {
    setSelectedValues((prev) => (prev.includes(valueId) ? prev.filter((id) => id !== valueId) : [...prev, valueId]))
  }

  const handleComplete = () => {
    // Mostrar confeti final
    setConfettiKey((prev) => prev + 1)

    // Guardar identidad corporativa
    const corporateIdentity = {
      mision,
      vision,
      values: selectedValues.map((id) => corporateValues.find((value) => value.id === id)).filter(Boolean),
      avatarStyle,
      tono,
      isUsingFallback,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("corporateIdentity", JSON.stringify(corporateIdentity))

    toast({
      title: "¡Identidad creada con éxito!",
      description: "Tu identidad corporativa ha sido guardada. Redirigiendo al dashboard...",
    })

    // Redirigir al dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  const regenerateContent = async () => {
    setConfettiKey((prev) => prev + 1)
    await generateIdentityWithAI()
  }

  // Obtener el contexto del negocio para pasar a TextImprover
  const getBusinessContext = () => {
    if (!diagnosticResults || !diagnosticResults.answers) return {}

    const answers = diagnosticResults.answers
    return {
      businessType: answers.business_type || "",
      businessStage: answers.business_stage || "",
      targetAudience: answers.target_audience || "",
      uniqueValue: answers.unique_value || "",
      goals: answers.goals || "",
      challenges: answers.challenges || "",
    }
  }

  // Si no hay datos, mostrar cargando
  if (!user || !diagnosticResults) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-16 w-16 animate-pulse text-kalabasboom-red mb-4" />
          <h2 className="text-2xl font-bold">Cargando...</h2>
          <p className="text-muted-foreground">Preparando tu identidad corporativa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {confettiKey > 0 && <ConfettiExplosion key={confettiKey} duration={2000} particleCount={150} />}

      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">KALABASBOOM OS: Identidad Corporativa</h1>
            <p className="mt-2 text-muted-foreground">
              {isGenerating ? "Creando tu identidad con IA..." : "Tu identidad corporativa personalizada"}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isUsingFallback && !isGenerating && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Modo Predeterminado</AlertTitle>
              <AlertDescription>
                Se generó una identidad predeterminada. Puedes editarla manualmente o intentar regenerar con IA.
              </AlertDescription>
            </Alert>
          )}

          {isGenerating ? (
            <Card>
              <CardHeader>
                <CardTitle>Generando tu identidad con IA</CardTitle>
                <CardDescription>
                  Estamos creando una identidad única que refleje la esencia de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-8">
                <div className="text-center">
                  <Sparkles className="mx-auto h-16 w-16 animate-pulse text-kalabasboom-red" />
                  <p className="mt-4 text-lg font-medium">La IA está trabajando en tu identidad...</p>
                </div>

                <div className="w-full space-y-6 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${completionStep >= 1 ? "bg-green-500" : "bg-muted"}`}
                      >
                        {completionStep >= 1 ? <CheckCircle2 className="h-5 w-5 text-white" /> : "1"}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Generando misión empresarial</p>
                        {completionStep >= 1 && (
                          <p className="text-sm text-muted-foreground">Misión creada con éxito</p>
                        )}
                      </div>
                    </div>
                    {completionStep >= 1 && generatedMision && (
                      <div className="ml-11 mt-2 p-3 bg-muted rounded-md text-sm">
                        <p className="italic">{generatedMision.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${completionStep >= 2 ? "bg-green-500" : "bg-muted"}`}
                      >
                        {completionStep >= 2 ? <CheckCircle2 className="h-5 w-5 text-white" /> : "2"}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Generando visión de futuro</p>
                        {completionStep >= 2 && (
                          <p className="text-sm text-muted-foreground">Visión creada con éxito</p>
                        )}
                      </div>
                    </div>
                    {completionStep >= 2 && generatedVision && (
                      <div className="ml-11 mt-2 p-3 bg-muted rounded-md text-sm">
                        <p className="italic">{generatedVision.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${completionStep >= 3 ? "bg-green-500" : "bg-muted"}`}
                      >
                        {completionStep >= 3 ? <CheckCircle2 className="h-5 w-5 text-white" /> : "3"}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Identificando valores y estilo visual</p>
                        {completionStep >= 3 && (
                          <p className="text-sm text-muted-foreground">Identidad visual creada con éxito</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div className="space-x-2">
                  <span className="text-sm font-medium">Tono:</span>
                  <select
                    value={tono}
                    onChange={(e) => setTono(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="profesional">Profesional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="amigable">Amigable</option>
                    <option value="innovador">Innovador</option>
                    <option value="autoritario">Autoritario</option>
                  </select>
                </div>
                <Button variant="outline" onClick={regenerateContent} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerar con IA
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mision">Misión</TabsTrigger>
                  <TabsTrigger value="vision">Visión</TabsTrigger>
                  <TabsTrigger value="valores">Valores</TabsTrigger>
                </TabsList>

                <TabsContent value="mision">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Misión
                        <Button variant="ghost" size="icon" onClick={() => setMision(generatedMision)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>Define el propósito fundamental de tu empresa</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          value={mision}
                          onChange={(e) => setMision(e.target.value)}
                          placeholder="¿Cuál es el propósito principal de tu empresa?"
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end">
                          <TextImprover
                            text={mision}
                            onImproved={setMision}
                            fieldType="mision"
                            tono={tono}
                            companyName={user.companyName}
                            businessContext={getBusinessContext()}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={() => setActiveTab("vision")}>
                        Siguiente
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="vision">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Visión
                        <Button variant="ghost" size="icon" onClick={() => setVision(generatedVision)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>Define hacia dónde se dirige tu empresa en el futuro</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          value={vision}
                          onChange={(e) => setVision(e.target.value)}
                          placeholder="¿Qué aspira a ser tu empresa en el futuro?"
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end">
                          <TextImprover
                            text={vision}
                            onImproved={setVision}
                            fieldType="vision"
                            tono={tono}
                            companyName={user.companyName}
                            businessContext={getBusinessContext()}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("mision")}>
                        Anterior
                      </Button>
                      <Button onClick={() => setActiveTab("valores")}>
                        Siguiente
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="valores">
                  <Card>
                    <CardHeader>
                      <CardTitle>Valores Corporativos</CardTitle>
                      <CardDescription>Selecciona 3-5 valores que representen a tu empresa</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        {corporateValues.map((value) => (
                          <div
                            key={value.id}
                            className={`flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted transition-colors ${
                              selectedValues.includes(value.id) ? "border-kalabasboom-red bg-kalabasboom-red/10" : ""
                            }`}
                            onClick={() => handleValueToggle(value.id)}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              {value.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{value.name}</h3>
                              <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                            {selectedValues.includes(value.id) && (
                              <CheckCircle2 className="h-5 w-5 text-kalabasboom-red" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-8">
                        <h3 className="font-medium mb-4">Avatar Empresarial</h3>
                        <div className="grid grid-cols-5 gap-4">
                          {avatarStyles.map((style) => (
                            <div
                              key={style.id}
                              className={`flex flex-col items-center gap-2 cursor-pointer transition-opacity hover:opacity-100 ${
                                avatarStyle === style.id ? "opacity-100" : "opacity-60"
                              }`}
                              onClick={() => setAvatarStyle(style.id)}
                            >
                              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${style.color}`}>
                                {style.icon}
                              </div>
                              <span className="text-xs">{style.name}</span>
                              {avatarStyle === style.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("vision")}>
                        Anterior
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={selectedValues.length < 3 || !avatarStyle || !mision || !vision}
                        className="bg-kalabasboom-red hover:bg-kalabasboom-red/90"
                      >
                        Completar
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-medium mb-4">Vista previa</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback
                      className={
                        avatarStyle === "rocket"
                          ? "bg-primary text-primary-foreground"
                          : avatarStyle === "target"
                            ? "bg-blue-500 text-white"
                            : avatarStyle === "zap"
                              ? "bg-yellow-500 text-black"
                              : avatarStyle === "shield"
                                ? "bg-green-500 text-white"
                                : avatarStyle === "heart"
                                  ? "bg-red-500 text-white"
                                  : "bg-muted"
                      }
                    >
                      {avatarStyle === "rocket" ? (
                        <Rocket className="h-8 w-8" />
                      ) : avatarStyle === "target" ? (
                        <Target className="h-8 w-8" />
                      ) : avatarStyle === "zap" ? (
                        <Zap className="h-8 w-8" />
                      ) : avatarStyle === "shield" ? (
                        <Shield className="h-8 w-8" />
                      ) : avatarStyle === "heart" ? (
                        <Heart className="h-8 w-8" />
                      ) : (
                        user?.companyName?.charAt(0) || "E"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{user.companyName}</h2>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedValues.map((valueId) => {
                        const value = corporateValues.find((v) => v.id === valueId)
                        return value ? (
                          <div
                            key={valueId}
                            className="flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {value.icon}
                            <span className="ml-1">{value.name}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Misión</h4>
                    <p className="text-sm text-muted-foreground">{mision || "No definida"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Visión</h4>
                    <p className="text-sm text-muted-foreground">{vision || "No definida"}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
