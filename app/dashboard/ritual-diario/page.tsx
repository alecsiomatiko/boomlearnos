"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  CheckCircle2,
  Clock,
  Calendar,
  Frown,
  Meh,
  Zap,
  Brain,
  Coffee,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Target,
} from "lucide-react"
import { getUser, getTodayCheckIn, saveDailyCheckIn, addUserPoints, saveNotification } from "@/lib/data-utils"
import type { User, DailyCheckIn } from "@/types"
import { v4 as uuidv4 } from "uuid"

const moodOptions = [
  { value: "productive", label: "Productivo", icon: <Zap className="h-5 w-5" /> },
  { value: "creative", label: "Creativo", icon: <Brain className="h-5 w-5" /> },
  { value: "focused", label: "Enfocado", icon: <Target className="h-5 w-5" /> },
  { value: "tired", label: "Cansado", icon: <Coffee className="h-5 w-5" /> },
  { value: "stressed", label: "Estresado", icon: <Frown className="h-5 w-5" /> },
  { value: "distracted", label: "Distraído", icon: <Meh className="h-5 w-5" /> },
]

const energyOptions = [
  { value: "1", label: "Muy baja", icon: <BatteryLow className="h-5 w-5 text-red-500" /> },
  { value: "2", label: "Baja", icon: <BatteryLow className="h-5 w-5 text-orange-500" /> },
  { value: "3", label: "Media", icon: <BatteryMedium className="h-5 w-5 text-yellow-500" /> },
  { value: "4", label: "Alta", icon: <BatteryMedium className="h-5 w-5 text-green-500" /> },
  { value: "5", label: "Muy alta", icon: <BatteryFull className="h-5 w-5 text-green-600" /> },
]

export default function RitualDiarioPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checkIn, setCheckIn] = useState<Partial<DailyCheckIn> | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para el formulario
  const [energyLevel, setEnergyLevel] = useState<"1" | "2" | "3" | "4" | "5" | "">("")
  const [mood, setMood] = useState<"productive" | "stressed" | "creative" | "tired" | "focused" | "distracted" | "">("")
  const [priority1, setPriority1] = useState("")
  const [priority2, setPriority2] = useState("")
  const [priority3, setPriority3] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    // Recuperar datos del usuario
    const userData = getUser()
    if (userData) {
      setUser(userData)

      // Verificar si ya se completó el check-in de hoy
      const todayCheckIn = getTodayCheckIn(userData.id)
      if (todayCheckIn) {
        setCheckIn(todayCheckIn)
        setIsCompleted(true)

        // Cargar datos del check-in existente
        setEnergyLevel(todayCheckIn.energyLevel.toString() as "1" | "2" | "3" | "4" | "5")
        setMood(todayCheckIn.mood)

        if (todayCheckIn.priorities.length > 0) {
          setPriority1(todayCheckIn.priorities[0] || "")
          setPriority2(todayCheckIn.priorities[1] || "")
          setPriority3(todayCheckIn.priorities[2] || "")
        }

        setNotes(todayCheckIn.notes || "")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = () => {
    if (!user) return

    if (!energyLevel || !mood || !priority1) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa al menos el nivel de energía, estado de ánimo y una prioridad.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Crear array de prioridades, filtrando las vacías
    const priorities = [priority1, priority2, priority3].filter((p) => p.trim() !== "")

    // Crear o actualizar check-in
    const newCheckIn: DailyCheckIn = {
      id: checkIn?.id || uuidv4(),
      userId: user.id,
      date: new Date().toISOString(),
      energyLevel: Number(energyLevel) as 1 | 2 | 3 | 4 | 5,
      mood: mood as "productive" | "stressed" | "creative" | "tired" | "focused" | "distracted",
      priorities,
      notes: notes.trim() !== "" ? notes : undefined,
      createdAt: new Date().toISOString(),
    }

    // Guardar check-in
    saveDailyCheckIn(newCheckIn)

    // Si es el primer check-in del día, otorgar puntos
    if (!isCompleted) {
      // Añadir puntos al usuario
      addUserPoints(user.id, 20)

      // Crear notificación
      saveNotification({
        id: uuidv4(),
        userId: user.id,
        type: "task_completed",
        title: "Ritual diario completado",
        message: "Has ganado 20 puntos por completar tu ritual diario",
        read: false,
        createdAt: new Date().toISOString(),
      })
    }

    setIsSubmitting(false)
    setIsCompleted(true)
    setCheckIn(newCheckIn)

    toast({
      title: "Ritual diario completado",
      description: "Has registrado tu check-in diario exitosamente.",
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ritual Diario</h1>
          <p className="text-muted-foreground">
            Comienza tu día con intención y claridad. Completa tu check-in diario.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(new Date())}</span>
          <Separator orientation="vertical" className="h-4" />
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        <Card className="liquid-glass-effect rounded-2xl border-0">
          <CardHeader>
            <CardTitle>Check-in Diario</CardTitle>
            <CardDescription>
              {isCompleted
                ? "Has completado tu check-in de hoy. Puedes editarlo si lo necesitas."
                : "Tómate un momento para reflexionar sobre cómo te sientes hoy y definir tus prioridades."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium">¿Cómo es tu nivel de energía hoy?</h3>
              <RadioGroup
                value={energyLevel}
                onValueChange={(value) => setEnergyLevel(value as "1" | "2" | "3" | "4" | "5")}
                className="grid grid-cols-1 md:grid-cols-5 gap-2"
                disabled={isSubmitting}
              >
                {energyOptions.map((option) => (
                  <div key={option.value} className="flex">
                    <RadioGroupItem value={option.value} id={`energy-${option.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`energy-${option.value}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">¿Cómo te sientes hoy?</h3>
              <RadioGroup
                value={mood}
                onValueChange={(value) =>
                  setMood(value as "productive" | "stressed" | "creative" | "tired" | "focused" | "distracted")
                }
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
                disabled={isSubmitting}
              >
                {moodOptions.map((option) => (
                  <div key={option.value} className="flex">
                    <RadioGroupItem value={option.value} id={`mood-${option.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`mood-${option.value}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">¿Cuáles son tus prioridades para hoy?</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    1
                  </div>
                  <Input
                    placeholder="Prioridad principal"
                    value={priority1}
                    onChange={(e) => setPriority1(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    2
                  </div>
                  <Input
                    placeholder="Segunda prioridad (opcional)"
                    value={priority2}
                    onChange={(e) => setPriority2(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    3
                  </div>
                  <Input
                    placeholder="Tercera prioridad (opcional)"
                    value={priority3}
                    onChange={(e) => setPriority3(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Notas adicionales (opcional)</h3>
              <Textarea
                placeholder="¿Hay algo más que quieras anotar sobre tu día?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Check-in completado</span>
              </div>
            ) : (
              <div></div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-kalabasboom-red hover:bg-kalabasboom-red/90"
            >
              {isCompleted ? "Actualizar check-in" : "Completar check-in"}
            </Button>
          </CardFooter>
        </Card>

        {isCompleted && (
          <Card className="liquid-glass-effect rounded-2xl border-0">
            <CardHeader>
              <CardTitle>Recomendaciones para hoy</CardTitle>
              <CardDescription>
                Basado en tu check-in, aquí hay algunas recomendaciones para aprovechar al máximo tu día.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {energyLevel === "1" || energyLevel === "2" ? (
                  <div className="flex items-start gap-3">
                    <BatteryLow className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Energía baja</h4>
                      <p className="text-sm text-muted-foreground">
                        Enfócate en tareas que requieran menos esfuerzo cognitivo. Considera tomar descansos cortos y
                        frecuentes.
                      </p>
                    </div>
                  </div>
                ) : energyLevel === "3" ? (
                  <div className="flex items-start gap-3">
                    <BatteryMedium className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Energía moderada</h4>
                      <p className="text-sm text-muted-foreground">
                        Alterna entre tareas que requieran concentración y tareas más rutinarias para mantener tu
                        energía.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <BatteryFull className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Energía alta</h4>
                      <p className="text-sm text-muted-foreground">
                        Aprovecha para abordar tareas complejas o creativas que requieran mayor concentración.
                      </p>
                    </div>
                  </div>
                )}

                {mood === "productive" || mood === "focused" ? (
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Estado mental óptimo</h4>
                      <p className="text-sm text-muted-foreground">
                        Aprovecha este estado para avanzar en tus prioridades más importantes y tareas que requieran
                        concentración.
                      </p>
                    </div>
                  </div>
                ) : mood === "creative" ? (
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Momento creativo</h4>
                      <p className="text-sm text-muted-foreground">
                        Dedica tiempo a la lluvia de ideas, planificación estratégica o resolución de problemas
                        complejos.
                      </p>
                    </div>
                  </div>
                ) : mood === "tired" || mood === "stressed" ? (
                  <div className="flex items-start gap-3">
                    <Coffee className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Necesitas recargarte</h4>
                      <p className="text-sm text-muted-foreground">
                        Considera tomar descansos más frecuentes, practicar respiración profunda o una caminata corta.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Meh className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Enfoque intermitente</h4>
                      <p className="text-sm text-muted-foreground">
                        Utiliza técnicas como Pomodoro (25 minutos de trabajo, 5 de descanso) para mantener el enfoque.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-kalabasboom-red mt-0.5" />
                  <div>
                    <h4 className="font-medium">Prioridades claras</h4>
                    <p className="text-sm text-muted-foreground">
                      Mantén tus prioridades visibles durante el día y celebra cada logro al completarlas.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
