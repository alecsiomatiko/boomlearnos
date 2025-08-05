import { v4 as uuidv4 } from "uuid"
import type {
  User,
  Task,
  DailyCheckIn,
  ActionPlan,
  Comment,
  Notification,
  DiagnosticResult,
  CorporateIdentity,
  Medal,
} from "@/types"

const sampleTasks: Omit<Task, "id" | "status" | "progress">[] = [
  {
    title: "Revisar el presupuesto mensual",
    description: "Analizar los gastos del último mes y ajustar las categorías si es necesario.",
    category: "Finanzas",
  },
  {
    title: "Definir 3 objetivos financieros para el trimestre",
    description: "Establecer metas claras, medibles y con plazos definidos.",
    category: "Finanzas",
  },
  {
    title: "Leer un capítulo de 'El Inversor Inteligente'",
    description: "Fomentar el hábito de la lectura financiera.",
    category: "Educación",
  },
  {
    title: "Hacer un curso rápido sobre gestión de riesgos",
    description: "Comprender los conceptos básicos de riesgo y diversificación.",
    category: "Educación",
  },
  {
    title: "Meditar durante 10 minutos",
    description: "Reducir el estrés para tomar mejores decisiones financieras.",
    category: "Bienestar",
  },
  { title: "Hacer 30 minutos de ejercicio", description: "Mejorar la salud física y mental.", category: "Bienestar" },
  {
    title: "Planificar las comidas de la semana",
    description: "Optimizar el gasto en supermercado y evitar compras impulsivas.",
    category: "Finanzas",
  },
  {
    title: "Contactar a un mentor o colega",
    description: "Ampliar la red de contactos y buscar nuevas oportunidades.",
    category: "Carrera",
  },
  {
    title: "Actualizar el perfil de LinkedIn",
    description: "Mantener el perfil profesional atractivo para reclutadores.",
    category: "Carrera",
  },
  {
    title: "Automatizar el pago de una factura",
    description: "Simplificar la gestión de pagos recurrentes y evitar recargos.",
    category: "Finanzas",
  },
  {
    title: "Investigar una nueva herramienta de productividad",
    description: "Buscar formas de optimizar el tiempo y las tareas diarias.",
    category: "Productividad",
  },
  {
    title: "Organizar el escritorio y el espacio de trabajo",
    description: "Un entorno ordenado fomenta la claridad mental.",
    category: "Productividad",
  },
  {
    title: "Revisar el plan de pensiones",
    description: "Asegurarse de que las contribuciones y la estrategia de inversión son adecuadas.",
    category: "Finanzas",
  },
  {
    title: "Escuchar un podcast sobre emprendimiento",
    description: "Inspirarse con historias de éxito y aprender de otros.",
    category: "Educación",
  },
  {
    title: "Escribir un diario de gratitud",
    description: "Enfocarse en los aspectos positivos para mejorar el estado de ánimo.",
    category: "Bienestar",
  },
  {
    title: "Cancelar una suscripción que no se utiliza",
    description: "Eliminar gastos innecesarios y liberar presupuesto.",
    category: "Finanzas",
  },
  {
    title: "Aprender una nueva fórmula de Excel o Google Sheets",
    description: "Mejorar las habilidades de análisis de datos.",
    category: "Productividad",
  },
  {
    title: "Hacer un 'brain dump' de todas las tareas pendientes",
    description: "Liberar la mente y organizar las prioridades.",
    category: "Productividad",
  },
  {
    title: "Establecer un límite de gasto para el fin de semana",
    description: "Controlar los gastos discrecionales y mantenerse en el presupuesto.",
    category: "Finanzas",
  },
  {
    title: "Ver un documental sobre economía global",
    description: "Entender las tendencias macroeconómicas que afectan las finanzas personales.",
    category: "Educación",
  },
  {
    title: "Preparar la ropa y el material para el día siguiente",
    description: "Empezar el día de forma organizada y sin estrés.",
    category: "Productividad",
  },
  {
    title: "Realizar una copia de seguridad de los archivos importantes",
    description: "Prevenir la pérdida de información valiosa.",
    category: "Seguridad",
  },
  {
    title: "Comparar precios de un seguro (coche, hogar, salud)",
    description: "Buscar mejores ofertas y ahorrar en primas.",
    category: "Finanzas",
  },
  {
    title: "Dedicar 20 minutos a un hobby creativo",
    description: "Estimular la creatividad y desconectar del trabajo.",
    category: "Bienestar",
  },
  {
    title: "Llamar a un familiar o amigo",
    description: "Mantener las relaciones personales es clave para el bienestar.",
    category: "Bienestar",
  },
  {
    title: "Revisar los extractos bancarios en busca de cargos anómalos",
    description: "Detectar posibles fraudes o errores a tiempo.",
    category: "Seguridad",
  },
  {
    title: "Crear una 'wishlist' de compras y esperar 48h",
    description: "Evitar compras impulsivas y evaluar la necesidad real.",
    category: "Finanzas",
  },
  {
    title: "Aportar una pequeña cantidad a un fondo de inversión",
    description: "Fomentar el hábito de la inversión regular.",
    category: "Finanzas",
  },
  {
    title: "Delegar una tarea en el trabajo o en casa",
    description: "Aprender a confiar en otros y liberar tiempo.",
    category: "Productividad",
  },
  {
    title: "Definir la tarea más importante para mañana (MIT)",
    description: "Asegurarse de que lo más importante se haga primero.",
    category: "Productividad",
  },
]

// --- Helper function to create dummy tasks ---
function createDummyTasks(userId: string): Task[] {
  const taskTemplates = [
    {
      title: "Definir 3 KPIs para Marketing de Contenidos",
      category: "marketing",
      priority: "high",
      points: 75,
      hours: 3,
    },
    { title: "Llamada de seguimiento con Cliente VIP", category: "equipo", priority: "urgent", points: 50, hours: 1 },
    {
      title: "Optimizar Proceso de Onboarding de Clientes",
      category: "estructura",
      priority: "medium",
      points: 120,
      hours: 8,
    },
    { title: "Revisar Presupuesto de Operaciones Q3", category: "finanzas", priority: "high", points: 80, hours: 4 },
    {
      title: "Crear un nuevo embudo de ventas para el producto X",
      category: "marketing",
      priority: "high",
      points: 150,
      hours: 10,
    },
    {
      title: "Investigar 5 nuevas herramientas de automatización",
      category: "estructura",
      priority: "low",
      points: 60,
      hours: 5,
    },
    {
      title: "Planificar la campaña de redes sociales de Octubre",
      category: "marketing",
      priority: "medium",
      points: 70,
      hours: 4,
    },
    {
      title: "Realizar encuesta de satisfacción del equipo",
      category: "equipo",
      priority: "medium",
      points: 40,
      hours: 2,
    },
    {
      title: "Analizar el flujo de caja de los últimos 6 meses",
      category: "finanzas",
      priority: "high",
      points: 90,
      hours: 3,
    },
    {
      title: "Actualizar la documentación de la API interna",
      category: "estructura",
      priority: "low",
      points: 50,
      hours: 6,
    },
    {
      title: "Preparar presentación para la junta directiva",
      category: "equipo",
      priority: "urgent",
      points: 100,
      hours: 5,
    },
    { title: "Auditoría de seguridad del sitio web", category: "estructura", priority: "high", points: 110, hours: 7 },
    {
      title: "Diseñar 3 nuevas creatividades para anuncios de Facebook",
      category: "marketing",
      priority: "medium",
      points: 65,
      hours: 3,
    },
    {
      title: "Negociar tarifas con proveedor de logística",
      category: "finanzas",
      priority: "medium",
      points: 85,
      hours: 2,
    },
    {
      title: "Sesión de brainstorming para nuevas funcionalidades",
      category: "equipo",
      priority: "low",
      points: 30,
      hours: 2,
    },
    {
      title: "Implementar un sistema de tickets de soporte",
      category: "estructura",
      priority: "high",
      points: 200,
      hours: 15,
    },
    {
      title: "Escribir 2 artículos para el blog corporativo",
      category: "marketing",
      priority: "medium",
      points: 70,
      hours: 4,
    },
    { title: "Revisar y optimizar los perfiles de puesto", category: "equipo", priority: "low", points: 45, hours: 3 },
    {
      title: "Proyección financiera para el próximo año fiscal",
      category: "finanzas",
      priority: "high",
      points: 130,
      hours: 8,
    },
    {
      title: "Configurar el seguimiento de conversiones en Google Analytics 4",
      category: "marketing",
      priority: "high",
      points: 80,
      hours: 3,
    },
    {
      title: "Desarrollar un plan de capacitación para el equipo de ventas",
      category: "equipo",
      priority: "medium",
      points: 95,
      hours: 6,
    },
    {
      title: "Evaluar la migración a un nuevo sistema CRM",
      category: "estructura",
      priority: "high",
      points: 180,
      hours: 12,
    },
    {
      title: "Crear un reporte de gastos hormiga de la empresa",
      category: "finanzas",
      priority: "medium",
      points: 55,
      hours: 2,
    },
    {
      title: "Organizar el evento de team building trimestral",
      category: "equipo",
      priority: "low",
      points: 40,
      hours: 4,
    },
    {
      title: "Optimizar la velocidad de carga de la página de inicio",
      category: "marketing",
      priority: "high",
      points: 100,
      hours: 5,
    },
    {
      title: "Definir la política de trabajo remoto",
      category: "estructura",
      priority: "medium",
      points: 60,
      hours: 3,
    },
    {
      title: "Realizar un análisis de la competencia",
      category: "marketing",
      priority: "medium",
      points: 75,
      hours: 4,
    },
    {
      title: "Automatizar el reporte de ventas semanal",
      category: "finanzas",
      priority: "medium",
      points: 90,
      hours: 5,
    },
    {
      title: "Entrevistar a 3 candidatos para la posición de Diseñador UX",
      category: "equipo",
      priority: "high",
      points: 60,
      hours: 3,
    },
    {
      title: "Crear un video tutorial del nuevo módulo de la plataforma",
      category: "marketing",
      priority: "medium",
      points: 110,
      hours: 6,
    },
  ]

  return taskTemplates.map((task, index) => ({
    id: uuidv4(),
    title: task.title,
    description: `Descripción detallada para la tarea: "${task.title}". Asignada por el sistema para mejorar el área de ${task.category}.`,
    status: "pending",
    priority: task.priority as "low" | "medium" | "high" | "urgent",
    category: task.category,
    assignedTo: userId,
    createdBy: "system",
    dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: task.hours,
    points: task.points,
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

export function getDailyQuests(): Task[] {
  return sampleTasks.map((task, index) => ({
    ...task,
    id: `task-${index + 1}`,
    status: index % 3 === 0 ? "completada" : index % 3 === 1 ? "en-progreso" : "pendiente",
    progress: index % 3 === 0 ? 100 : index % 3 === 1 ? Math.floor(Math.random() * 80) + 10 : 0,
  }))
}

// Funciones para usuarios
export function getUser(): User | null {
  if (typeof window === "undefined") return null

  const storedUser = localStorage.getItem("user")
  if (!storedUser) return null

  try {
    const userData = JSON.parse(storedUser)
    return {
      id: userData.id || uuidv4(),
      name: userData.name || "Usuario Demo",
      email: userData.email || "demo@example.com",
      companyName: userData.companyName || "Kalabasboom Inc.",
      role: userData.role || "admin",
      avatar: userData.avatar,
      level: userData.level || "intern",
      points: userData.points || 0,
      createdAt: userData.createdAt || new Date().toISOString(),
      badges: userData.badges || [],
    }
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

export function saveUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function addUserPoints(points: number): User | null {
  if (typeof window === "undefined") return null
  const user = getUser()
  if (user) {
    const updatedUser = { ...user, points: user.points + points }
    saveUser(updatedUser)
    return updatedUser
  }
  return null
}

// Funciones para tareas
export function getTasks(): Task[] {
  if (typeof window === "undefined") return []

  const storedTasks = localStorage.getItem("tasks")
  if (!storedTasks) return []

  try {
    return JSON.parse(storedTasks)
  } catch (error) {
    console.error("Error parsing tasks data:", error)
    return []
  }
}

export function saveTask(task: Task): Task {
  if (typeof window === "undefined") return task

  const tasks = getTasks()
  const existingTaskIndex = tasks.findIndex((t) => t.id === task.id)

  if (existingTaskIndex >= 0) {
    tasks[existingTaskIndex] = { ...task, updatedAt: new Date().toISOString() }
  } else {
    tasks.push({
      ...task,
      id: task.id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  localStorage.setItem("tasks", JSON.stringify(tasks))
  return task
}

export function updateTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

export function deleteTask(taskId: string): boolean {
  if (typeof window === "undefined") return false
  const tasks = getTasks()
  const filteredTasks = tasks.filter((task) => task.id !== taskId)
  if (filteredTasks.length === tasks.length) return false
  localStorage.setItem("tasks", JSON.stringify(filteredTasks))
  return true
}

// --- SINGLE SOURCE OF TRUTH FOR INITIALIZATION ---
export function initializeAndGetUserData(): User {
  const existingUser = getUser()
  if (existingUser) {
    // If user exists, ensure tasks exist too for returning users
    if (localStorage.getItem("tasks") === null || getTasks().length < 30) {
      const dummyTasks = createDummyTasks(existingUser.id)
      updateTasks(dummyTasks)
    }
    return existingUser
  }

  // No user exists, create a new one with dummy data
  const newUser: User = {
    id: uuidv4(),
    name: "Usuario Demo",
    email: "demo@example.com",
    companyName: "Kalabasboom Inc.",
    role: "admin",
    level: "intern",
    points: 0,
    createdAt: new Date().toISOString(),
    badges: [],
  }
  saveUser(newUser)

  // Seed dummy tasks
  const dummyTasks = createDummyTasks(newUser.id)
  updateTasks(dummyTasks)

  // Initialize other data if needed
  if (!localStorage.getItem("dailyCheckIns")) localStorage.setItem("dailyCheckIns", JSON.stringify([]))
  if (!localStorage.getItem("comments")) localStorage.setItem("comments", JSON.stringify([]))
  if (!localStorage.getItem("notifications")) localStorage.setItem("notifications", JSON.stringify([]))
  if (!localStorage.getItem("medals")) initializeMedals()
  if (!localStorage.getItem(`userMedals_${newUser.id}`))
    localStorage.setItem(`userMedals_${newUser.id}`, JSON.stringify([]))

  return newUser
}

// --- Other functions (unchanged) ---

export function getDailyCheckIns(): DailyCheckIn[] {
  if (typeof window === "undefined") return []
  const storedCheckIns = localStorage.getItem("dailyCheckIns")
  return storedCheckIns ? JSON.parse(storedCheckIns) : []
}

export function saveDailyCheckIn(checkIn: DailyCheckIn): DailyCheckIn {
  if (typeof window === "undefined") return checkIn
  const checkIns = getDailyCheckIns()
  const today = new Date().toISOString().split("T")[0]
  const existingCheckInIndex = checkIns.findIndex(
    (ci) => ci.userId === checkIn.userId && ci.date.split("T")[0] === today,
  )
  if (existingCheckInIndex >= 0) {
    checkIns[existingCheckInIndex] = { ...checkIn, createdAt: new Date().toISOString() }
  } else {
    checkIns.push({
      ...checkIn,
      id: checkIn.id || uuidv4(),
      date: checkIn.date || today,
      createdAt: new Date().toISOString(),
    })
  }
  localStorage.setItem("dailyCheckIns", JSON.stringify(checkIns))
  return checkIn
}

export function getTodayCheckIn(userId: string): DailyCheckIn | null {
  if (typeof window === "undefined") return null
  const checkIns = getDailyCheckIns()
  const today = new Date().toISOString().split("T")[0]
  return checkIns.find((ci) => ci.userId === userId && ci.date.split("T")[0] === today) || null
}

export function getActionPlan(): ActionPlan | null {
  if (typeof window === "undefined") return null
  const storedPlan = localStorage.getItem("actionPlan")
  return storedPlan ? JSON.parse(storedPlan) : null
}

export function saveActionPlan(plan: ActionPlan): ActionPlan {
  if (typeof window === "undefined") return plan
  const updatedPlan = { ...plan, updatedAt: new Date().toISOString() }
  localStorage.setItem("actionPlan", JSON.stringify(updatedPlan))
  return updatedPlan
}

export function getComments(taskId: string): Comment[] {
  if (typeof window === "undefined") return []
  const storedComments = localStorage.getItem("comments")
  if (!storedComments) return []
  const allComments = JSON.parse(storedComments)
  return allComments.filter((comment: Comment) => comment.taskId === taskId)
}

export function saveComment(comment: Comment): Comment {
  if (typeof window === "undefined") return comment
  const comments = getAllComments()
  const newComment = { ...comment, id: comment.id || uuidv4(), createdAt: new Date().toISOString() }
  comments.push(newComment)
  localStorage.setItem("comments", JSON.stringify(comments))
  return newComment
}

export function getAllComments(): Comment[] {
  if (typeof window === "undefined") return []
  const storedComments = localStorage.getItem("comments")
  return storedComments ? JSON.parse(storedComments) : []
}

export function getNotifications(userId: string): Notification[] {
  if (typeof window === "undefined") return []
  const storedNotifications = localStorage.getItem("notifications")
  if (!storedNotifications) return []
  const allNotifications = JSON.parse(storedNotifications)
  return allNotifications.filter((notification: Notification) => notification.userId === userId)
}

export function saveNotification(notification: Notification): Notification {
  if (typeof window === "undefined") return notification
  const notifications = getAllNotifications()
  const newNotification = {
    ...notification,
    id: notification.id || uuidv4(),
    read: notification.read || false,
    createdAt: new Date().toISOString(),
  }
  notifications.push(newNotification)
  localStorage.setItem("notifications", JSON.stringify(notifications))
  return newNotification
}

export function markNotificationAsRead(notificationId: string): boolean {
  if (typeof window === "undefined") return false
  const notifications = getAllNotifications()
  const notificationIndex = notifications.findIndex((n) => n.id === notificationId)
  if (notificationIndex < 0) return false
  notifications[notificationIndex].read = true
  localStorage.setItem("notifications", JSON.stringify(notifications))
  return true
}

export function getAllNotifications(): Notification[] {
  if (typeof window === "undefined") return []
  const storedNotifications = localStorage.getItem("notifications")
  return storedNotifications ? JSON.parse(storedNotifications) : []
}

export function getDiagnosticResults(): DiagnosticResult | null {
  if (typeof window === "undefined") return null
  const storedResults = localStorage.getItem("diagnosticResults")
  return storedResults ? JSON.parse(storedResults) : null
}

export function getCorporateIdentity(): CorporateIdentity | null {
  if (typeof window === "undefined") return null
  const storedIdentity = localStorage.getItem("corporateIdentity")
  return storedIdentity ? JSON.parse(storedIdentity) : null
}

export function initializeMedals(): void {
  if (typeof window === "undefined") return
  const medals: Medal[] = [
    {
      id: "starter_badge",
      name: "STARTER",
      description: "Completaste los primeros pasos en KALABASBOOM OS",
      category: "progression",
      level: "bronze",
      icon: "award",
      unlockedAt: null,
    },
    {
      id: "task_master_bronze",
      name: "Maestro de Tareas - Bronce",
      description: "Completaste 5 tareas",
      category: "productivity",
      level: "bronze",
      icon: "check-circle",
      unlockedAt: null,
      requirement: { type: "tasks", count: 5 },
    },
    {
      id: "task_master_silver",
      name: "Maestro de Tareas - Plata",
      description: "Completaste 15 tareas",
      category: "productivity",
      level: "silver",
      icon: "check-circle",
      unlockedAt: null,
      requirement: { type: "tasks", count: 15 },
    },
    {
      id: "task_master_gold",
      name: "Maestro de Tareas - Oro",
      description: "Completaste 30 tareas",
      category: "productivity",
      level: "gold",
      icon: "check-circle",
      unlockedAt: null,
      requirement: { type: "tasks", count: 30 },
    },
  ]
  localStorage.setItem("medals", JSON.stringify(medals))
}
