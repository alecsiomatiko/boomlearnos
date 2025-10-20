export interface DiagnosticQuestion {
  id: string
  type: 'radio' | 'checkbox' | 'voice_text' | 'text' | 'textarea'
  question: string
  required: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  aiStyle?: 'jony_ive' | 'professional' | 'concise' | 'inspiring'
}

export interface DiagnosticSection {
  id: string
  title: string
  icon: string
  description: string
  questions: DiagnosticQuestion[]
}

export const advancedDiagnosticQuestions: DiagnosticSection[] = [
  {
    id: "capacidades",
    title: "Capacidades Actuales",
    icon: "Settings",
    description: "Evaluemos qué tan preparado está tu negocio",
    questions: [
      {
        id: "digital_readiness",
        type: "radio",
        question: "¿Qué tan digitalizado está tu negocio actualmente?",
        required: true,
        options: [
          { value: "analog", label: "📄 Principalmente análogo (papel, efectivo)" },
          { value: "basic_digital", label: "💻 Digital básico (email, redes sociales)" },
          { value: "intermediate", label: "🔧 Herramientas intermedias (CRM, web)" },
          { value: "advanced", label: "🚀 Altamente digitalizado (automación, datos)" },
          { value: "cutting_edge", label: "🤖 Vanguardia (IA, blockchain, IoT)" }
        ]
      },
      {
        id: "team_skills",
        type: "checkbox",
        question: "¿Qué habilidades tiene tu equipo actual? (selecciona todas las que apliquen)",
        required: true,
        options: [
          { value: "sales", label: "🎯 Ventas y negociación" },
          { value: "marketing", label: "📱 Marketing digital" },
          { value: "tech", label: "💻 Desarrollo técnico" },
          { value: "design", label: "🎨 Diseño y creatividad" },
          { value: "operations", label: "⚙️ Operaciones y logística" },
          { value: "finance", label: "💰 Finanzas y contabilidad" },
          { value: "leadership", label: "👥 Liderazgo y gestión" },
          { value: "customer_service", label: "🤝 Atención al cliente" }
        ]
      },
      {
        id: "biggest_bottleneck",
        type: "radio",
        question: "¿Cuál es el mayor cuello de botella en tu negocio?",
        required: true,
        options: [
          { value: "lead_generation", label: "🔍 Generar leads/prospectos" },
          { value: "conversion", label: "💱 Convertir leads en clientes" },
          { value: "delivery", label: "📦 Entregar producto/servicio" },
          { value: "customer_retention", label: "🔄 Retener clientes" },
          { value: "scaling_operations", label: "📈 Escalar operaciones" },
          { value: "team_productivity", label: "⚡ Productividad del equipo" },
          { value: "cash_flow", label: "💸 Flujo de efectivo" },
          { value: "market_positioning", label: "🎯 Posicionamiento en mercado" }
        ]
      }
    ]
  },
  {
    id: "recursos",
    title: "Recursos y Limitaciones",
    icon: "DollarSign",
    description: "Entendamos con qué recursos cuentas",
    questions: [
      {
        id: "monthly_budget",
        type: "radio",
        question: "¿Cuál es tu presupuesto mensual disponible para hacer crecer el negocio?",
        required: true,
        options: [
          { value: "minimal", label: "💡 Menos de $500 USD" },
          { value: "small", label: "🌱 $500 - $2,000 USD" },
          { value: "medium", label: "🚀 $2,000 - $10,000 USD" },
          { value: "large", label: "💼 $10,000 - $50,000 USD" },
          { value: "enterprise", label: "🏢 Más de $50,000 USD" }
        ]
      },
      {
        id: "time_availability",
        type: "radio",
        question: "¿Cuánto tiempo puedes dedicar semanalmente a implementar mejoras?",
        required: true,
        options: [
          { value: "minimal", label: "⏰ 1-5 horas (fines de semana)" },
          { value: "part_time", label: "📅 5-20 horas (algunas tardes)" },
          { value: "substantial", label: "💪 20-40 horas (medio tiempo)" },
          { value: "full_time", label: "🎯 40+ horas (tiempo completo)" }
        ]
      },
      {
        id: "learning_preference",
        type: "radio",
        question: "¿Cómo prefieres aprender nuevas habilidades empresariales?",
        required: true,
        options: [
          { value: "hands_on", label: "🛠️ Aprendiendo haciendo (prueba y error)" },
          { value: "courses", label: "📚 Cursos estructurados y certificaciones" },
          { value: "mentorship", label: "👨‍🏫 Mentoría y consultoría personalizada" },
          { value: "community", label: "👥 Comunidades y networking" },
          { value: "self_research", label: "🔍 Investigación independiente" }
        ]
      }
    ]
  },
  {
    id: "metas_especificas",
    title: "Metas Específicas",
    icon: "Target",
    description: "Definamos objetivos medibles y alcanzables",
    questions: [
      {
        id: "revenue_goal",
        type: "radio",
        question: "¿Cuál es tu meta de ingresos para los próximos 12 meses?",
        required: true,
        options: [
          { value: "survival", label: "💪 Supervivencia y estabilidad" },
          { value: "growth_10", label: "📈 Crecer 10-50%" },
          { value: "growth_50", label: "🚀 Crecer 50-100%" },
          { value: "double", label: "⚡ Duplicar ingresos" },
          { value: "scale", label: "🌟 Escalar 3x o más" }
        ]
      },
      {
        id: "success_metric",
        type: "radio",
        question: "¿Cuál sería el indicador más importante de éxito para ti?",
        required: true,
        options: [
          { value: "revenue", label: "💰 Ingresos totales" },
          { value: "customers", label: "👥 Número de clientes" },
          { value: "market_share", label: "📊 Participación de mercado" },
          { value: "team_size", label: "🏢 Tamaño del equipo" },
          { value: "impact", label: "🌍 Impacto social/ambiental" },
          { value: "freedom", label: "🗽 Libertad personal y flexibilidad" },
          { value: "recognition", label: "🏆 Reconocimiento en la industria" }
        ]
      },
      {
        id: "next_milestone",
        type: "voice_text",
        question: "¿Cuál es el próximo gran hito que quieres alcanzar en tu negocio?",
        placeholder: "Describe específicamente qué quieres lograr en los próximos 3-6 meses. Sé tan detallado como puedas...",
        required: true,
        aiStyle: "professional"
      }
    ]
  },
  {
    id: "desafios_actuales",
    title: "Desafíos Actuales",
    icon: "AlertTriangle",
    description: "Identifiquemos qué te está frenando",
    questions: [
      {
        id: "urgent_problem",
        type: "radio",
        question: "¿Cuál es el problema más urgente que necesitas resolver?",
        required: true,
        options: [
          { value: "cash_flow", label: "💸 Problemas de flujo de efectivo" },
          { value: "customer_acquisition", label: "🎯 Dificultad para conseguir clientes" },
          { value: "product_market_fit", label: "🎪 Producto no encaja en el mercado" },
          { value: "team_issues", label: "👥 Problemas con el equipo" },
          { value: "competition", label: "⚔️ Competencia muy agresiva" },
          { value: "scaling", label: "📈 No sé cómo escalar" },
          { value: "burnout", label: "😴 Agotamiento personal" },
          { value: "regulation", label: "📋 Problemas regulatorios/legales" }
        ]
      },
      {
        id: "fear_factor",
        type: "radio",
        question: "¿Qué te genera más ansiedad sobre el futuro de tu negocio?",
        required: true,
        options: [
          { value: "financial_stability", label: "💰 Estabilidad financiera personal" },
          { value: "business_failure", label: "📉 Que fracase el negocio" },
          { value: "competition", label: "🏃‍♂️ Quedarme atrás de la competencia" },
          { value: "team_dependence", label: "👥 Dependencia del equipo clave" },
          { value: "market_changes", label: "🌊 Cambios drásticos en el mercado" },
          { value: "technology", label: "🤖 Disrupciones tecnológicas" },
          { value: "work_life_balance", label: "⚖️ Perder balance vida-trabajo" }
        ]
      },
      {
        id: "support_system",
        type: "voice_text",
        question: "¿Qué tipo de apoyo sientes que más necesitas en este momento?",
        placeholder: "Puede ser apoyo técnico, emocional, financiero, estratégico... Explica qué tipo de ayuda te haría la mayor diferencia.",
        required: true,
        aiStyle: "professional"
      }
    ]
  }
]