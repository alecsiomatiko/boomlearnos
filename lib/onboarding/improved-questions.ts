export interface OnboardingQuestion {
  id: string
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'voice_text'
  question: string
  required: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  aiStyle?: 'jony_ive' | 'professional' | 'concise' | 'inspiring'
}

export interface OnboardingSection {
  id: string
  title: string
  icon: string
  description: string
  questions: OnboardingQuestion[]
}

export const improvedOnboardingQuestions: OnboardingSection[] = [
  {
    id: "vision",
    title: "Tu Visión Empresarial",
    icon: "Eye",
    description: "Exploremos tu visión y aspiraciones",
    questions: [
      {
        id: "business_inspiration",
        type: "radio",
        question: "¿Qué te inspiró a crear tu empresa?",
        required: true,
        options: [
          { value: "problem_solving", label: "🎯 Resolver un problema específico que viví" },
          { value: "passion", label: "❤️ Seguir mi pasión y convertirla en negocio" },
          { value: "market_opportunity", label: "💡 Vi una oportunidad de mercado única" },
          { value: "financial_freedom", label: "💰 Buscar independencia financiera" },
          { value: "family_legacy", label: "👨‍👩‍👧‍👦 Crear un legado familiar" },
          { value: "social_impact", label: "🌍 Generar un impacto social positivo" },
          { value: "innovation", label: "🚀 Innovar en una industria tradicional" }
        ]
      },
      {
        id: "success_vision",
        type: "voice_text",
        question: "Si tu empresa fuera un éxito absoluto en 5 años, ¿cómo se vería ese éxito?",
        placeholder: "Imagina que es 2030 y tu empresa es reconocida mundialmente. Describe cómo se ve, qué impacto tiene, cómo te sientes...",
        required: true,
        aiStyle: "jony_ive"
      },
      {
        id: "daily_motivation",
        type: "radio",
        question: "¿Qué te motiva más en tu día a día como empresario?",
        required: true,
        options: [
          { value: "customer_happiness", label: "😊 Ver clientes felices con mi producto/servicio" },
          { value: "team_growth", label: "📈 Desarrollar y ver crecer a mi equipo" },
          { value: "innovation", label: "💡 Crear soluciones innovadoras" },
          { value: "financial_goals", label: "💵 Alcanzar metas financieras" },
          { value: "market_leadership", label: "🏆 Liderar en mi mercado" },
          { value: "personal_growth", label: "🌱 Mi crecimiento personal y profesional" }
        ]
      }
    ]
  },
  {
    id: "empresa_actual",
    title: "Tu Empresa Hoy",
    icon: "Building2",
    description: "Entendamos tu situación actual",
    questions: [
      {
        id: "business_model",
        type: "radio",
        question: "¿Cuál describe mejor tu modelo de negocio actual?",
        required: true,
        options: [
          { value: "b2b_service", label: "🏢 B2B - Servicios a empresas" },
          { value: "b2b_product", label: "📦 B2B - Productos a empresas" },
          { value: "b2c_service", label: "👥 B2C - Servicios a consumidores" },
          { value: "b2c_product", label: "🛍️ B2C - Productos a consumidores" },
          { value: "marketplace", label: "🏪 Marketplace/Plataforma" },
          { value: "subscription", label: "🔄 Modelo de suscripción" },
          { value: "freemium", label: "🆓 Freemium" },
          { value: "hybrid", label: "🔀 Híbrido/Múltiples modelos" }
        ]
      },
      {
        id: "current_stage",
        type: "radio",
        question: "¿En qué etapa está tu empresa actualmente?",
        required: true,
        options: [
          { value: "idea", label: "💭 Validando la idea" },
          { value: "mvp", label: "🛠️ Desarrollando MVP" },
          { value: "first_customers", label: "👋 Primeros clientes" },
          { value: "product_market_fit", label: "🎯 Buscando product-market fit" },
          { value: "scaling", label: "📈 Escalando operaciones" },
          { value: "established", label: "🏢 Empresa establecida" },
          { value: "expanding", label: "🌍 Expandiendo a nuevos mercados" }
        ]
      },
      {
        id: "main_challenge",
        type: "radio",
        question: "¿Cuál es tu principal desafío en este momento?",
        required: true,
        options: [
          { value: "finding_customers", label: "🔍 Encontrar y atraer clientes" },
          { value: "product_development", label: "⚙️ Desarrollo de producto/servicio" },
          { value: "funding", label: "💰 Financiamiento y capital" },
          { value: "team_building", label: "👥 Construir el equipo correcto" },
          { value: "operations", label: "📊 Optimizar operaciones" },
          { value: "competition", label: "⚔️ Competencia en el mercado" },
          { value: "scaling", label: "📈 Escalabilidad del negocio" },
          { value: "work_life_balance", label: "⚖️ Balance vida-trabajo" }
        ]
      },
      {
        id: "unique_strength",
        type: "voice_text",
        question: "¿Cuál consideras que es tu fortaleza única como empresa?",
        placeholder: "Piensa en qué te hace diferente... ¿Es tu experiencia, tu enfoque, tu tecnología, tu equipo, tu proceso?",
        required: true,
        aiStyle: "jony_ive"
      }
    ]
  },
  {
    id: "clientes",
    title: "Tus Clientes",
    icon: "Users",
    description: "Conozcamos a las personas que sirves",
    questions: [
      {
        id: "customer_discovery",
        type: "radio",
        question: "¿Cómo descubriste a tu cliente ideal?",
        required: true,
        options: [
          { value: "personal_experience", label: "👤 Era mi propio problema/necesidad" },
          { value: "market_research", label: "📊 Investigación de mercado formal" },
          { value: "industry_experience", label: "🏭 Experiencia previa en la industria" },
          { value: "customer_feedback", label: "💬 Feedback directo de clientes" },
          { value: "competitor_analysis", label: "🔍 Análisis de la competencia" },
          { value: "networking", label: "🤝 Conversaciones y networking" },
          { value: "trial_error", label: "🎲 Prueba y error" }
        ]
      },
      {
        id: "customer_emotion",
        type: "radio",
        question: "¿Cómo se sienten tus clientes ANTES de encontrar tu solución?",
        required: true,
        options: [
          { value: "frustrated", label: "😤 Frustrados con alternativas existentes" },
          { value: "overwhelmed", label: "😵 Abrumados por la complejidad" },
          { value: "anxious", label: "😰 Ansiosos por resultados" },
          { value: "confused", label: "🤔 Confundidos por las opciones" },
          { value: "skeptical", label: "🤨 Escépticos de las promesas" },
          { value: "hopeful", label: "🤞 Esperanzados pero cautelosos" },
          { value: "urgent", label: "⏰ Con urgencia de solucionar" }
        ]
      },
      {
        id: "customer_transformation",
        type: "voice_text",
        question: "Describe la transformación que experimenta un cliente después de trabajar contigo",
        placeholder: "Cuenta la historia: ¿Cómo llegan a ti? ¿Qué cambia en su vida o negocio? ¿Cómo se sienten después?",
        required: true,
        aiStyle: "jony_ive"
      },
      {
        id: "customer_feedback_frequency",
        type: "radio",
        question: "¿Con qué frecuencia recibes feedback directo de tus clientes?",
        required: true,
        options: [
          { value: "daily", label: "📅 Diariamente" },
          { value: "weekly", label: "📅 Semanalmente" },
          { value: "monthly", label: "📅 Mensualmente" },
          { value: "quarterly", label: "📅 Trimestralmente" },
          { value: "rarely", label: "😐 Rara vez" },
          { value: "never", label: "😬 Nunca o casi nunca" }
        ]
      }
    ]
  },
  {
    id: "competencia",
    title: "Tu Posición Competitiva",
    icon: "Target",
    description: "Entendamos tu ventaja en el mercado",
    questions: [
      {
        id: "competitive_advantage",
        type: "radio",
        question: "¿Cuál es tu principal ventaja competitiva?",
        required: true,
        options: [
          { value: "price", label: "💰 Precio más competitivo" },
          { value: "quality", label: "⭐ Calidad superior" },
          { value: "speed", label: "⚡ Velocidad de entrega/servicio" },
          { value: "customization", label: "🎨 Personalización única" },
          { value: "expertise", label: "🎓 Experiencia/conocimiento especializado" },
          { value: "technology", label: "🔧 Tecnología avanzada" },
          { value: "relationships", label: "🤝 Relaciones cercanas con clientes" },
          { value: "innovation", label: "💡 Innovación constante" }
        ]
      },
      {
        id: "market_position",
        type: "radio",
        question: "¿Cómo te posicionas en tu mercado?",
        required: true,
        options: [
          { value: "premium", label: "👑 Premium - Alta calidad, precio alto" },
          { value: "value", label: "⚖️ Valor - Buena calidad, precio justo" },
          { value: "budget", label: "💵 Económico - Precio bajo, funcional" },
          { value: "luxury", label: "💎 Lujo - Exclusivo y aspiracional" },
          { value: "innovative", label: "🚀 Innovador - Tecnología de vanguardia" },
          { value: "traditional", label: "🏛️ Tradicional - Confiable y establecido" },
          { value: "niche", label: "🎯 Nicho especializado" }
        ]
      },
      {
        id: "growth_strategy",
        type: "voice_text",
        question: "¿Cuál es tu estrategia para crecer en los próximos 2 años?",
        placeholder: "Describe tu plan: ¿Nuevos productos? ¿Nuevos mercados? ¿Más clientes del mismo tipo? ¿Expansión geográfica?",
        required: true,
        aiStyle: "jony_ive"
      }
    ]
  },
  {
    id: "cultura",
    title: "Cultura y Valores",
    icon: "Heart",
    description: "Define la esencia de tu organización",
    questions: [
      {
        id: "work_philosophy",
        type: "radio",
        question: "¿Cuál de estas filosofías de trabajo refleja mejor tu empresa?",
        required: true,
        options: [
          { value: "excellence", label: "🏆 Excelencia en todo lo que hacemos" },
          { value: "innovation", label: "💡 Innovación constante" },
          { value: "collaboration", label: "🤝 Colaboración y trabajo en equipo" },
          { value: "customer_first", label: "👥 El cliente es lo primero" },
          { value: "agility", label: "⚡ Agilidad y adaptabilidad" },
          { value: "sustainability", label: "🌱 Sostenibilidad y responsabilidad" },
          { value: "transparency", label: "🔍 Transparencia y honestidad" },
          { value: "empowerment", label: "💪 Empoderamiento del equipo" }
        ]
      },
      {
        id: "decision_making",
        type: "radio",
        question: "¿Cómo describes tu estilo de toma de decisiones?",
        required: true,
        options: [
          { value: "data_driven", label: "📊 Basado en datos y análisis" },
          { value: "intuitive", label: "🧠 Intuitivo y experiencial" },
          { value: "collaborative", label: "👥 Colaborativo con el equipo" },
          { value: "quick_decisive", label: "⚡ Rápido y decisivo" },
          { value: "cautious", label: "🤔 Cauteloso y reflexivo" },
          { value: "customer_input", label: "💬 Influenciado por feedback de clientes" },
          { value: "balanced", label: "⚖️ Equilibrio entre datos e intuición" }
        ]
      },
      {
        id: "company_personality",
        type: "voice_text",
        question: "Si tu empresa fuera una persona, ¿cómo la describirías?",
        placeholder: "Imagina que tu empresa tiene personalidad: ¿Es seria o divertida? ¿Conservadora o arriesgada? ¿Cálida o profesional?",
        required: true,
        aiStyle: "jony_ive"
      }
    ]
  }
] as const

export interface OnboardingQuestion {
  id: string
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'voice_text'
  question: string
  required: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  aiStyle?: 'jony_ive' | 'professional' | 'concise' | 'inspiring'
}

export interface OnboardingSection {
  id: string
  title: string
  icon: string
  description: string
  questions: OnboardingQuestion[]
}