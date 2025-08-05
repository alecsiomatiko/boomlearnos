import type { QuizQuestion, BusinessProfile } from "@/types/quiz"

export const quizQuestions: QuizQuestion[] = [
  {
    id: "vision-clarity",
    category: "Visión y Estrategia",
    question: "¿Qué tan clara es la visión de tu empresa?",
    type: "single",
    weight: 3,
    options: [
      { id: "very-clear", text: "Muy clara y todos la conocen", value: 5 },
      { id: "clear", text: "Clara para el equipo directivo", value: 4 },
      { id: "somewhat", text: "Algo clara pero necesita refinamiento", value: 3 },
      { id: "unclear", text: "No muy clara", value: 2 },
      { id: "none", text: "No tenemos una visión definida", value: 1 },
    ],
  },
  {
    id: "market-position",
    category: "Mercado y Competencia",
    question: "¿Cómo describes la posición de tu empresa en el mercado?",
    type: "single",
    weight: 3,
    options: [
      { id: "leader", text: "Líder en nuestro sector", value: 5 },
      { id: "strong", text: "Posición fuerte y reconocida", value: 4 },
      { id: "competitive", text: "Competitiva pero con desafíos", value: 3 },
      { id: "struggling", text: "Luchando por posicionarnos", value: 2 },
      { id: "unknown", text: "Posición incierta o débil", value: 1 },
    ],
  },
  {
    id: "team-culture",
    category: "Equipo y Cultura",
    question: "¿Cómo calificarías la cultura organizacional?",
    type: "single",
    weight: 2,
    options: [
      { id: "excellent", text: "Excelente, todos están alineados", value: 5 },
      { id: "good", text: "Buena, con algunos aspectos a mejorar", value: 4 },
      { id: "average", text: "Promedio, necesita desarrollo", value: 3 },
      { id: "poor", text: "Deficiente, hay conflictos", value: 2 },
      { id: "toxic", text: "Tóxica o inexistente", value: 1 },
    ],
  },
  {
    id: "financial-health",
    category: "Finanzas y Operaciones",
    question: "¿Cuál es la salud financiera de tu empresa?",
    type: "single",
    weight: 3,
    options: [
      { id: "excellent", text: "Excelente, crecimiento sostenido", value: 5 },
      { id: "good", text: "Buena, rentable y estable", value: 4 },
      { id: "stable", text: "Estable pero sin crecimiento", value: 3 },
      { id: "concerning", text: "Preocupante, pérdidas ocasionales", value: 2 },
      { id: "critical", text: "Crítica, pérdidas constantes", value: 1 },
    ],
  },
  {
    id: "innovation-level",
    category: "Innovación y Tecnología",
    question: "¿Qué tan innovadora es tu empresa?",
    type: "single",
    weight: 2,
    options: [
      { id: "pioneer", text: "Pionera en innovación del sector", value: 5 },
      { id: "innovative", text: "Muy innovadora, siempre mejorando", value: 4 },
      { id: "adaptive", text: "Adaptamos innovaciones existentes", value: 3 },
      { id: "follower", text: "Seguimos tendencias del mercado", value: 2 },
      { id: "traditional", text: "Muy tradicional, resistente al cambio", value: 1 },
    ],
  },
  {
    id: "customer-satisfaction",
    category: "Clientes y Mercado",
    question: "¿Cómo es la satisfacción de tus clientes?",
    type: "single",
    weight: 3,
    options: [
      { id: "exceptional", text: "Excepcional, nos recomiendan activamente", value: 5 },
      { id: "high", text: "Alta, clientes leales y satisfechos", value: 4 },
      { id: "good", text: "Buena, pero hay margen de mejora", value: 3 },
      { id: "average", text: "Promedio, algunos clientes insatisfechos", value: 2 },
      { id: "poor", text: "Baja, muchas quejas y rotación", value: 1 },
    ],
  },
  {
    id: "growth-challenges",
    category: "Crecimiento y Escalabilidad",
    question: "¿Cuáles son tus principales desafíos de crecimiento?",
    type: "multiple",
    weight: 2,
    options: [
      { id: "funding", text: "Falta de financiamiento", value: 1 },
      { id: "talent", text: "Dificultad para encontrar talento", value: 1 },
      { id: "processes", text: "Procesos no escalables", value: 1 },
      { id: "market", text: "Limitaciones del mercado", value: 1 },
      { id: "competition", text: "Competencia intensa", value: 1 },
      { id: "none", text: "No tenemos desafíos significativos", value: 0 },
    ],
  },
  {
    id: "leadership-style",
    category: "Liderazgo y Gestión",
    question: "¿Cómo describes tu estilo de liderazgo?",
    type: "single",
    weight: 2,
    options: [
      { id: "transformational", text: "Transformacional, inspiro y motivo", value: 5 },
      { id: "collaborative", text: "Colaborativo, trabajo en equipo", value: 4 },
      { id: "directive", text: "Directivo, doy instrucciones claras", value: 3 },
      { id: "hands-off", text: "Delegativo, doy autonomía", value: 3 },
      { id: "micromanager", text: "Controlador, superviso todo", value: 2 },
    ],
  },
]

export const businessProfiles: Record<string, BusinessProfile> = {
  BoomStarter: {
    type: "BoomStarter",
    title: "🚀 BoomStarter - El Emprendedor Emergente",
    description:
      "Estás en las primeras etapas de tu journey empresarial. Tienes una gran visión pero necesitas estructurar y fortalecer las bases de tu negocio.",
    strengths: [
      "Visión emprendedora clara",
      "Motivación y energía alta",
      "Flexibilidad y adaptabilidad",
      "Pasión por el proyecto",
    ],
    weaknesses: [
      "Procesos poco estructurados",
      "Recursos limitados",
      "Experiencia en gestión",
      "Sistemas financieros básicos",
    ],
    recommendations: [
      "Desarrolla un plan de negocio sólido",
      "Establece procesos operativos básicos",
      "Busca mentores y asesores",
      "Enfócate en validar tu propuesta de valor",
    ],
    actionPlan: {
      shortTerm: [
        "Definir misión, visión y valores claros",
        "Establecer métricas básicas de seguimiento",
        "Crear un plan financiero simple",
      ],
      mediumTerm: [
        "Desarrollar procesos operativos estándar",
        "Construir un equipo básico",
        "Implementar sistemas de gestión",
      ],
      longTerm: ["Escalar operaciones", "Expandir a nuevos mercados", "Desarrollar liderazgo organizacional"],
    },
  },
  BoomBuilder: {
    type: "BoomBuilder",
    title: "🏗️ BoomBuilder - El Constructor de Empresas",
    description:
      "Tu empresa está en crecimiento activo. Tienes bases sólidas y estás construyendo sistemas y procesos para escalar.",
    strengths: [
      "Procesos operativos establecidos",
      "Equipo comprometido",
      "Crecimiento constante",
      "Sistemas financieros funcionales",
    ],
    weaknesses: [
      "Dependencia del fundador",
      "Procesos aún no completamente escalables",
      "Necesidad de más talento especializado",
      "Sistemas tecnológicos básicos",
    ],
    recommendations: [
      "Desarrolla liderazgo en el equipo",
      "Invierte en tecnología y automatización",
      "Crea procesos escalables",
      "Diversifica fuentes de ingresos",
    ],
    actionPlan: {
      shortTerm: ["Documentar todos los procesos clave", "Implementar KPIs avanzados", "Desarrollar plan de sucesión"],
      mediumTerm: [
        "Automatizar procesos repetitivos",
        "Expandir el equipo directivo",
        "Explorar nuevos canales de venta",
      ],
      longTerm: [
        "Internacionalización",
        "Diversificación de productos/servicios",
        "Preparación para inversión externa",
      ],
    },
  },
  BoomScaler: {
    type: "BoomScaler",
    title: "📈 BoomScaler - El Escalador Estratégico",
    description:
      "Tu empresa está lista para el siguiente nivel. Tienes sistemas sólidos y estás enfocado en escalar de manera inteligente y sostenible.",
    strengths: [
      "Sistemas y procesos maduros",
      "Equipo directivo sólido",
      "Posición competitiva fuerte",
      "Finanzas saludables y predecibles",
    ],
    weaknesses: [
      "Complejidad organizacional creciente",
      "Necesidad de innovación constante",
      "Gestión de múltiples stakeholders",
      "Mantener cultura en crecimiento",
    ],
    recommendations: [
      "Invierte en innovación y R&D",
      "Desarrolla alianzas estratégicas",
      "Fortalece la cultura organizacional",
      "Explora nuevos mercados geográficos",
    ],
    actionPlan: {
      shortTerm: [
        "Optimizar estructura organizacional",
        "Implementar sistemas de innovación",
        "Desarrollar partnerships estratégicos",
      ],
      mediumTerm: [
        "Expansión geográfica planificada",
        "Adquisiciones estratégicas",
        "Desarrollo de nuevas líneas de negocio",
      ],
      longTerm: ["Liderazgo de mercado", "Ecosistema de productos/servicios", "Impacto social y sostenibilidad"],
    },
  },
  BoomLeader: {
    type: "BoomLeader",
    title: "👑 BoomLeader - El Líder de Industria",
    description:
      "Tu empresa es un referente en su sector. Tienes la responsabilidad y oportunidad de liderar la transformación de tu industria.",
    strengths: [
      "Liderazgo de mercado establecido",
      "Organización madura y eficiente",
      "Innovación constante",
      "Impacto significativo en la industria",
    ],
    weaknesses: [
      "Riesgo de complacencia",
      "Presión constante por innovar",
      "Gestión de expectativas altas",
      "Complejidad de múltiples mercados",
    ],
    recommendations: [
      "Lidera la transformación digital del sector",
      "Desarrolla el próximo generation de líderes",
      "Invierte en sostenibilidad e impacto social",
      "Crea ecosistemas de innovación",
    ],
    actionPlan: {
      shortTerm: [
        "Definir visión de industria a 10 años",
        "Crear programas de desarrollo de liderazgo",
        "Establecer métricas de impacto social",
      ],
      mediumTerm: [
        "Liderar iniciativas de industria",
        "Desarrollar plataformas de ecosistema",
        "Mentorear otras empresas del sector",
      ],
      longTerm: [
        "Transformación completa de la industria",
        "Legado de liderazgo sostenible",
        "Impacto global positivo",
      ],
    },
  },
}

export function calculateBusinessProfile(totalScore: number, maxScore: number): BusinessProfile {
  const percentage = (totalScore / maxScore) * 100

  if (percentage >= 85) return businessProfiles.BoomLeader
  if (percentage >= 70) return businessProfiles.BoomScaler
  if (percentage >= 55) return businessProfiles.BoomBuilder
  return businessProfiles.BoomStarter
}
