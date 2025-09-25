"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  Shield,
  Home,
  User
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Estructura del cuestionario con diseño limpio
const questionSections = [
  {
    id: "empresa",
    title: "Información de tu Empresa",
    icon: Building2,
    description: "Cuéntanos sobre tu negocio actual",
    questions: [
      {
        id: "industry",
        type: "radio",
        question: "¿En qué industria opera tu empresa?",
        required: true,
        options: [
          { value: "tecnologia", label: "Tecnología y Software" },
          { value: "servicios", label: "Servicios Profesionales" },
          { value: "retail", label: "Retail y E-commerce" },
          { value: "manufactura", label: "Manufactura y Producción" },
          { value: "salud", label: "Salud y Bienestar" },
          { value: "educacion", label: "Educación y Formación" },
          { value: "finanzas", label: "Finanzas y Seguros" },
          { value: "inmobiliaria", label: "Bienes Raíces" },
          { value: "alimentaria", label: "Alimentaria y Bebidas" },
          { value: "consultoria", label: "Consultoría" },
          { value: "otro", label: "Otro" }
        ]
      },
      {
        id: "company_size",
        type: "radio",
        question: "¿Cuál es el tamaño actual de tu empresa?",
        required: true,
        options: [
          { value: "solo", label: "Solo yo (emprendedor individual)" },
          { value: "pequena", label: "2-10 empleados" },
          { value: "mediana_pequena", label: "11-50 empleados" },
          { value: "mediana", label: "51-200 empleados" },
          { value: "grande", label: "Más de 200 empleados" }
        ]
      }
    ]
  },
  {
    id: "estrategia",
    title: "Estrategia y Objetivos",
    icon: Target,
    description: "Define tus metas y estrategias de negocio",
    questions: [
      {
        id: "business_stage",
        type: "radio",
        question: "¿En qué etapa se encuentra tu negocio?",
        required: true,
        options: [
          { value: "idea", label: "Tengo una idea, pero aún no he empezado" },
          { value: "startup", label: "Startup en fase inicial (0-2 años)" },
          { value: "crecimiento", label: "En crecimiento (2-5 años)" },
          { value: "establecida", label: "Empresa establecida (5+ años)" },
          { value: "expansion", label: "En expansión o escalamiento" },
          { value: "transformacion", label: "En proceso de transformación" }
        ]
      },
      {
        id: "main_goals",
        type: "textarea",
        question: "¿Cuáles son tus principales objetivos para los próximos 12 meses?",
        required: true,
        placeholder: "Describe tus metas principales..."
      }
    ]
  }
]
          { value: "marketing", label: "Marketing y Publicidad" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        id: "company_size",
        type: "radio",
        question: "¿Cuál es el tamaño actual de tu empresa?",
        required: true,
        options: [
          { value: "solo", label: "Solo yo (emprendedor individual)" },
          { value: "pequena", label: "2-10 empleados" },
          { value: "mediana", label: "11-50 empleados" },
          { value: "grande", label: "51-200 empleados" },
          { value: "corporativa", label: "Más de 200 empleados" },
        ],
      },
      {
        id: "business_stage",
        type: "radio",
        question: "¿En qué etapa se encuentra tu negocio?",
        required: true,
        options: [
          { value: "idea", label: "Tengo una idea, pero aún no he empezado" },
          { value: "startup", label: "Startup en fase inicial (0-2 años)" },
          { value: "crecimiento", label: "En crecimiento (2-5 años)" },
          { value: "establecida", label: "Empresa establecida (5+ años)" },
          { value: "expansion", label: "En expansión o escalamiento" },
          { value: "transformacion", label: "En proceso de transformación" },
        ],
      },
      {
        id: "revenue_stage",
        type: "radio",
        question: "¿Cuál es tu situación de ingresos actual?",
        required: true,
        options: [
          { value: "pre_revenue", label: "Pre-ingresos (aún no genero ventas)" },
          { value: "primeros_ingresos", label: "Primeros ingresos (menos de $10K/mes)" },
          { value: "crecimiento_temprano", label: "Crecimiento temprano ($10K-$50K/mes)" },
          { value: "crecimiento_medio", label: "Crecimiento medio ($50K-$200K/mes)" },
          { value: "establecido", label: "Establecido ($200K+/mes)" },
        ],
      },
    ],
  },
  {
    id: "proposicion",
    title: "Propuesta de Valor",
    icon: <Lightbulb className="h-6 w-6" />,
    description: "Define qué te hace único en el mercado",
    questions: [
      {
        id: "main_product_service",
        type: "textarea",
        question: "Describe en detalle tu producto o servicio principal",
        placeholder:
          "Ej: Desarrollamos software de gestión empresarial que automatiza procesos contables y financieros para PyMEs, reduciendo el tiempo de procesamiento en un 70%...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "unique_value_proposition",
        type: "textarea",
        question: "¿Qué te diferencia de tu competencia? ¿Cuál es tu ventaja competitiva única?",
        placeholder:
          "Ej: Somos los únicos que ofrecemos integración completa con bancos locales, soporte 24/7 en español y precios 50% más bajos que la competencia internacional...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "problem_solving",
        type: "textarea",
        question: "¿Qué problema específico resuelves para tus clientes?",
        placeholder:
          "Ej: Las PyMEs pierden 15 horas semanales en tareas contables manuales y cometen errores costosos. Nosotros automatizamos estos procesos...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "customer_transformation",
        type: "textarea",
        question: "¿Cómo transformas la vida o negocio de tus clientes?",
        placeholder:
          "Ej: Nuestros clientes pasan de trabajar 60 horas semanales a 40, reducen errores en un 90% y aumentan su rentabilidad en promedio 25%...",
        required: true,
        aiSuggestion: true,
      },
    ],
  },
  {
    id: "audiencia",
    title: "Audiencia Objetivo",
    icon: <Users className="h-6 w-6" />,
    description: "Define a quién sirves y por qué te eligen",
    questions: [
      {
        id: "target_customer",
        type: "textarea",
        question: "Describe a tu cliente ideal en detalle (demografía, psicografía, comportamiento)",
        placeholder:
          "Ej: Dueños de PyMEs de 30-50 años, con facturación de $500K-$5M anuales, que valoran la eficiencia, están abiertos a la tecnología pero necesitan soporte personalizado...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "customer_pain_points",
        type: "checkbox",
        question: "¿Cuáles son los principales dolores de tus clientes? (selecciona todos los que apliquen)",
        required: true,
        options: [
          { value: "tiempo", label: "Falta de tiempo para tareas importantes" },
          { value: "costos", label: "Costos operativos muy altos" },
          { value: "eficiencia", label: "Procesos ineficientes o manuales" },
          { value: "calidad", label: "Problemas de calidad en productos/servicios" },
          { value: "competencia", label: "Presión competitiva intensa" },
          { value: "tecnologia", label: "Falta de herramientas tecnológicas adecuadas" },
          { value: "talento", label: "Dificultad para encontrar talento calificado" },
          { value: "escalabilidad", label: "Dificultad para escalar el negocio" },
          { value: "regulaciones", label: "Complejidad regulatoria" },
          { value: "financiamiento", label: "Acceso limitado a financiamiento" },
        ],
      },
      {
        id: "customer_decision_factors",
        type: "checkbox",
        question: "¿Qué factores son más importantes para tus clientes al elegirte?",
        required: true,
        options: [
          { value: "precio", label: "Precio competitivo" },
          { value: "calidad", label: "Alta calidad del producto/servicio" },
          { value: "confianza", label: "Confianza y reputación" },
          { value: "soporte", label: "Excelente servicio al cliente" },
          { value: "innovacion", label: "Innovación y tecnología" },
          { value: "rapidez", label: "Rapidez en la entrega" },
          { value: "personalizacion", label: "Personalización" },
          { value: "experiencia", label: "Experiencia y expertise" },
          { value: "flexibilidad", label: "Flexibilidad y adaptabilidad" },
          { value: "resultados", label: "Resultados comprobados" },
        ],
      },
    ],
  },
  {
    id: "objetivos",
    title: "Objetivos y Aspiraciones",
    icon: <Target className="h-6 w-6" />,
    description: "Define hacia dónde quieres llevar tu empresa",
    questions: [
      {
        id: "short_term_goals",
        type: "textarea",
        question: "¿Cuáles son tus objetivos principales para los próximos 12 meses?",
        placeholder:
          "Ej: Aumentar ventas en 40%, contratar 5 empleados clave, lanzar 2 productos nuevos, expandir a 3 ciudades nuevas...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "long_term_vision",
        type: "textarea",
        question: "¿Cómo te imaginas tu empresa en 5-10 años? ¿Cuál es tu visión de éxito?",
        placeholder:
          "Ej: Ser la plataforma líder en Latinoamérica para automatización contable, con presencia en 10 países, 100K+ clientes activos y un equipo de 500 personas...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "impact_goals",
        type: "textarea",
        question: "¿Qué impacto quieres generar en tu industria, comunidad o el mundo?",
        placeholder:
          "Ej: Democratizar el acceso a herramientas financieras profesionales para PyMEs, ayudando a crear 10,000 empleos nuevos en la región...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "success_metrics",
        type: "checkbox",
        question: "¿Cómo defines el éxito para tu empresa?",
        required: true,
        options: [
          { value: "revenue", label: "Crecimiento de ingresos" },
          { value: "market_share", label: "Participación de mercado" },
          { value: "customer_satisfaction", label: "Satisfacción del cliente" },
          { value: "team_growth", label: "Crecimiento del equipo" },
          { value: "innovation", label: "Innovación y desarrollo de productos" },
          { value: "social_impact", label: "Impacto social positivo" },
          { value: "sustainability", label: "Sostenibilidad ambiental" },
          { value: "profitability", label: "Rentabilidad sostenible" },
          { value: "recognition", label: "Reconocimiento de la industria" },
          { value: "personal_fulfillment", label: "Realización personal" },
        ],
      },
    ],
  },
  {
    id: "cultura",
    title: "Cultura y Valores",
    icon: <Shield className="h-6 w-6" />,
    description: "Define la personalidad y principios de tu empresa",
    questions: [
      {
        id: "company_personality",
        type: "checkbox",
        question: "¿Cómo describirías la personalidad de tu empresa?",
        required: true,
        options: [
          { value: "innovadora", label: "Innovadora y vanguardista" },
          { value: "confiable", label: "Confiable y estable" },
          { value: "agil", label: "Ágil y adaptable" },
          { value: "humana", label: "Humana y cercana" },
          { value: "profesional", label: "Profesional y seria" },
          { value: "creativa", label: "Creativa y original" },
          { value: "transparente", label: "Transparente y honesta" },
          { value: "ambiciosa", label: "Ambiciosa y determinada" },
          { value: "colaborativa", label: "Colaborativa y inclusiva" },
          { value: "sostenible", label: "Sostenible y responsable" },
        ],
      },
      {
        id: "core_principles",
        type: "textarea",
        question: "¿Cuáles son los principios fundamentales que nunca comprometerías?",
        placeholder:
          "Ej: Nunca sacrificaríamos la calidad por velocidad, siempre seremos transparentes con nuestros clientes, priorizamos el bienestar de nuestro equipo...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "work_culture",
        type: "radio",
        question: "¿Cómo describes la cultura de trabajo que quieres crear?",
        required: true,
        options: [
          { value: "colaborativa", label: "Colaborativa y en equipo" },
          { value: "autonoma", label: "Autónoma y con libertad" },
          { value: "estructurada", label: "Estructurada y organizada" },
          { value: "innovadora", label: "Innovadora y experimental" },
          { value: "orientada_resultados", label: "Orientada a resultados" },
          { value: "equilibrada", label: "Equilibrio vida-trabajo" },
        ],
      },
      {
        id: "communication_style",
        type: "radio",
        question: "¿Cuál es el estilo de comunicación que mejor representa a tu empresa?",
        required: true,
        options: [
          { value: "formal", label: "Formal y profesional" },
          { value: "casual", label: "Casual y relajado" },
          { value: "tecnico", label: "Técnico y especializado" },
          { value: "amigable", label: "Amigable y cercano" },
          { value: "directo", label: "Directo y sin rodeos" },
          { value: "inspiracional", label: "Inspiracional y motivador" },
        ],
      },
    ],
  },
  {
    id: "desafios",
    title: "Desafíos y Oportunidades",
    icon: <TrendingUp className="h-6 w-6" />,
    description: "Identifica obstáculos y oportunidades de crecimiento",
    questions: [
      {
        id: "main_challenges",
        type: "checkbox",
        question: "¿Cuáles son tus principales desafíos actuales?",
        required: true,
        options: [
          { value: "financiamiento", label: "Acceso a financiamiento" },
          { value: "talento", label: "Atracción y retención de talento" },
          { value: "competencia", label: "Competencia intensa" },
          { value: "tecnologia", label: "Adopción de nuevas tecnologías" },
          { value: "escalabilidad", label: "Escalabilidad de operaciones" },
          { value: "marketing", label: "Marketing y adquisición de clientes" },
          { value: "regulaciones", label: "Cumplimiento regulatorio" },
          { value: "supply_chain", label: "Cadena de suministro" },
          { value: "digitalizacion", label: "Transformación digital" },
          { value: "sostenibilidad", label: "Sostenibilidad y responsabilidad social" },
        ],
      },
      {
        id: "growth_opportunities",
        type: "textarea",
        question: "¿Qué oportunidades de crecimiento ves en tu mercado?",
        placeholder:
          "Ej: El mercado de automatización contable crecerá 25% anual, hay demanda insatisfecha en ciudades secundarias, nuevas regulaciones requieren nuestras soluciones...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "competitive_advantages",
        type: "textarea",
        question: "¿Cuáles consideras que son tus fortalezas únicas frente a la competencia?",
        placeholder:
          "Ej: Tenemos el mejor equipo técnico de la región, relaciones exclusivas con proveedores clave, patentes en tecnologías críticas...",
        required: true,
        aiSuggestion: true,
      },
      {
        id: "innovation_areas",
        type: "checkbox",
        question: "¿En qué áreas planeas innovar o diferenciarte?",
        required: true,
        options: [
          { value: "producto", label: "Desarrollo de productos" },
          { value: "servicio", label: "Experiencia de servicio" },
          { value: "tecnologia", label: "Tecnología y automatización" },
          { value: "modelo_negocio", label: "Modelo de negocio" },
          { value: "sostenibilidad", label: "Sostenibilidad" },
          { value: "personalizacion", label: "Personalización" },
          { value: "eficiencia", label: "Eficiencia operativa" },
          { value: "colaboracion", label: "Colaboración y partnerships" },
        ],
      },
    ],
  },
]

export default function DiagnosticoPage() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/register")
      }
    } else {
      router.push("/register")
    }
  }, [router])

  const currentSectionData = questionSections[currentSection]
  const progress = ((currentSection + 1) / questionSections.length) * 100

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentValues = prev[questionId] || []
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, value],
        }
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((v: string) => v !== value),
        }
      }
    })
  }

  const isCurrentSectionComplete = () => {
    return currentSectionData.questions.every((question) => {
      if (!question.required) return true
      const answer = answers[question.id]
      if (question.type === "checkbox") {
        return answer && Array.isArray(answer) && answer.length > 0
      }
      return answer && String(answer).trim() !== ""
    })
  }

  const handleNext = () => {
    if (currentSection < questionSections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleComplete = async () => {
    setIsAnalyzing(true)

    try {
      // Simular análisis con IA
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Crear estructura de datos robusta
      const diagnosticResults = {
        answers: answers || {},
        completedAt: new Date().toISOString(),
        sectionsCompleted: questionSections.length,
        totalQuestions: questionSections.reduce((acc, section) => acc + section.questions.length, 0),
        version: "2.0",
        // Datos estructurados para la IA
        businessProfile: {
          industry: answers.industry || "servicios",
          companySize: answers.company_size || "pequena",
          businessStage: answers.business_stage || "crecimiento",
          revenueStage: answers.revenue_stage || "primeros_ingresos",
          mainProduct: answers.main_product_service || "",
          uniqueValue: answers.unique_value_proposition || "",
          targetCustomer: answers.target_customer || "",
          shortTermGoals: answers.short_term_goals || "",
          longTermVision: answers.long_term_vision || "",
          coreValues: answers.company_personality || [],
          challenges: answers.main_challenges || [],
        },
      }

      // Guardar con validación
      try {
        localStorage.setItem("diagnosticResults", JSON.stringify(diagnosticResults))
        console.log("✅ Diagnóstico guardado correctamente:", diagnosticResults)
      } catch (storageError) {
        console.error("❌ Error guardando diagnóstico:", storageError)
        throw new Error("No se pudo guardar el diagnóstico")
      }

      // Actualizar usuario con flag de diagnóstico completado
      if (user) {
        const updatedUser = {
          ...user,
          diagnosticCompleted: true,
          lastDiagnosticDate: new Date().toISOString(),
        }
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser))
          console.log("✅ Usuario actualizado correctamente")
        } catch (userError) {
          console.error("❌ Error actualizando usuario:", userError)
        }
      }

      toast({
        title: "¡Diagnóstico completado!",
        description: "Hemos analizado tu información. Ahora crearemos tu identidad corporativa personalizada.",
      })

      // Redirigir a la página de identidad
      router.push("/onboarding/identidad")
    } catch (error) {
      console.error("❌ Error completing diagnostic:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al procesar tu diagnóstico. Intenta nuevamente.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Función para obtener contexto del negocio
  const getBusinessContext = () => {
    return {
      companyName: user?.companyName || "Mi Empresa",
      industry: answers.industry || "",
      businessStage: answers.business_stage || "",
      companySize: answers.company_size || "",
      mainProduct: answers.main_product_service || "",
      targetCustomer: answers.target_customer || "",
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <h2 className="text-2xl font-bold">Cargando...</h2>
          <p className="text-muted-foreground">Preparando tu diagnóstico</p>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <h2 className="text-2xl font-bold">Analizando tu información...</h2>
          <p className="text-muted-foreground">
            Estamos procesando tus respuestas para crear tu perfil empresarial único
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Diagnóstico Empresarial Estratégico</h1>
            <p className="mt-2 text-muted-foreground">
              Responde estas preguntas para que podamos crear una identidad corporativa perfecta para tu empresa
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-muted-foreground">
                {currentSection + 1} de {questionSections.length} secciones
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {currentSectionData.icon}
                </div>
                <div>
                  <CardTitle>{currentSectionData.title}</CardTitle>
                  <CardDescription>{currentSectionData.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {currentSectionData.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Label className="text-base font-medium leading-relaxed">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {question.aiSuggestion && (
                      <AISuggestion
                        questionId={question.id}
                        questionText={question.question}
                        businessContext={getBusinessContext()}
                        onSuggestionSelect={(suggestion) => handleAnswerChange(question.id, suggestion)}
                      />
                    )}
                  </div>

                  {question.type === "radio" && (
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options?.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                            <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "checkbox" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options?.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`${question.id}-${option.value}`}
                            checked={(answers[question.id] || []).includes(option.value)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(question.id, option.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "textarea" && (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      className="min-h-[120px]"
                    />
                  )}

                  {question.type === "input" && (
                    <Input
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                    />
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentSection === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isCurrentSectionComplete()}
                className="bg-kalabasboom-red hover:bg-kalabasboom-red/90"
              >
                {currentSection === questionSections.length - 1 ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completar Diagnóstico
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
