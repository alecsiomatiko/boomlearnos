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

// ✨ DIAGNÓSTICO INICIAL DE ONBOARDING - 10 PREGUNTAS ESENCIALES
// Este cuestionario está diseñado para que la IA pueda generar:
// 1. Misión empresarial
// 2. Visión empresarial
// 3. Valores corporativos
// 4. Mini diagnóstico inicial (aparecerá en mega-diagnostico)

export const advancedDiagnosticQuestions: DiagnosticSection[] = [
  {
    id: "identidad_negocio",
    title: "Identidad del Negocio",
    icon: "Building2",
    description: "Conoce tu negocio y su propósito",
    questions: [
      {
        id: "business_purpose",
        type: "voice_text",
        question: "¿Cuál es el propósito principal de tu negocio? ¿Qué problema resuelves?",
        placeholder: "Describe qué hace tu negocio y por qué existe. Ejemplo: 'Ayudamos a pequeñas empresas a digitalizarse para que puedan competir en el mercado moderno...'",
        required: true,
        aiStyle: "inspiring"
      },
      {
        id: "target_customer",
        type: "voice_text",
        question: "¿Quién es tu cliente ideal? Descríbelo en detalle",
        placeholder: "Describe características demográficas, psicográficas, necesidades y comportamientos. Ejemplo: 'Emprendedores entre 30-45 años que buscan escalar su negocio...'",
        required: true,
        aiStyle: "professional"
      },
      {
        id: "unique_value",
        type: "voice_text",
        question: "¿Qué te hace diferente de tu competencia? ¿Cuál es tu ventaja única?",
        placeholder: "Explica tu propuesta de valor única. ¿Por qué los clientes deberían elegirte a ti? Sé específico...",
        required: true,
        aiStyle: "professional"
      }
    ]
  },
  {
    id: "situacion_actual",
    title: "Situación Actual",
    icon: "Activity",
    description: "Evalúa dónde estás ahora",
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
          { value: "advanced", label: "� Altamente digitalizado (automación, datos)" },
          { value: "cutting_edge", label: "� Vanguardia (IA, blockchain, IoT)" }
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
      },
      {
        id: "team_size_stage",
        type: "radio",
        question: "¿En qué etapa se encuentra tu negocio?",
        required: true,
        options: [
          { value: "idea", label: "💡 Idea / Pre-lanzamiento" },
          { value: "startup", label: "🚀 Startup (0-2 años, menos de 10 empleados)" },
          { value: "growth", label: "� Crecimiento (2-5 años, 10-50 empleados)" },
          { value: "mature", label: "� Consolidado (5+ años, 50+ empleados)" },
          { value: "enterprise", label: "� Empresa establecida (100+ empleados)" }
        ]
      }
    ]
  },
  {
    id: "recursos_objetivos",
    title: "Recursos y Objetivos",
    icon: "Target",
    description: "Define tus metas y recursos disponibles",
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
        id: "core_values",
        type: "checkbox",
        question: "¿Cuáles son los valores más importantes para tu empresa? (elige hasta 5)",
        required: true,
        options: [
          { value: "innovation", label: "� Innovación" },
          { value: "quality", label: "⭐ Calidad" },
          { value: "customer_focus", label: "🤝 Enfoque al cliente" },
          { value: "integrity", label: "✨ Integridad" },
          { value: "teamwork", label: "� Trabajo en equipo" },
          { value: "sustainability", label: "� Sustentabilidad" },
          { value: "excellence", label: "🏆 Excelencia" },
          { value: "social_impact", label: "🌍 Impacto social" },
          { value: "agility", label: "⚡ Agilidad" },
          { value: "transparency", label: "� Transparencia" }
        ]
      },
      {
        id: "long_term_vision",
        type: "voice_text",
        question: "¿Dónde quieres ver tu negocio en 5 años? ¿Cuál es tu visión a largo plazo?",
        placeholder: "Describe tu visión: tamaño, impacto, posición en el mercado, legado. Ejemplo: 'En 5 años queremos ser la empresa líder en...'",
        required: true,
        aiStyle: "inspiring"
      },
      {
        id: "immediate_challenge",
        type: "voice_text",
        question: "¿Cuál es el desafío más urgente que necesitas resolver en los próximos 3 meses?",
        placeholder: "Sé específico sobre el problema actual y por qué es urgente. Ejemplo: 'Necesitamos duplicar nuestros clientes porque...'",
        required: true,
        aiStyle: "professional"
      }
    ]
  }
]