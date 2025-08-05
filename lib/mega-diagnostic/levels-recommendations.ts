// Este archivo contendrá la lógica para los niveles y recomendaciones
// Por ahora, lo dejamos como placeholder para llenarlo después con la lógica de cada módulo.

export interface NivelResultado {
  nivel: string
  descripcion: string
  recomendaciones: string[]
  badge?: string // Opcional, si aplica
}

export function calcularNivelModulo1Submodulo1(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 33)
    return {
      nivel: "Caótico",
      descripcion: "Tu estructura es informal.",
      recomendaciones: ["Plantilla de organigrama con IA", "Sugerencia de nuevos roles"],
      badge: "org_caotica",
    }
  if (percentage <= 66)
    return {
      nivel: "Flexible",
      descripcion: "Hay roles, pero falta claridad.",
      recomendaciones: ["Definir responsabilidades", "Implementar OKRs básicos"],
      badge: "org_flexible",
    }
  return {
    nivel: "Estructurado",
    descripcion: "Estructura clara y roles definidos.",
    recomendaciones: ["Plan de crecimiento organizacional", "Evaluaciones de desempeño"],
    badge: "org_estructurada",
  }
}

export function calcularNivelModulo1Submodulo2(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 33)
    return {
      nivel: "BoomTyrant",
      descripcion: "Liderazgo controlador.",
      recomendaciones: ["Técnicas de delegación", "Fomentar confianza"],
      badge: "lider_tyrant",
    }
  if (percentage <= 66)
    return {
      nivel: "BoomBoss",
      descripcion: "Liderazgo balanceado, puede mejorar delegación.",
      recomendaciones: ["Definir niveles de autoridad", "Desarrollar líderes de área"],
      badge: "lider_boss",
    }
  return {
    nivel: "BoomZen",
    descripcion: "Líder que empodera y delega.",
    recomendaciones: ["Documentar filosofía de liderazgo", "Programa de mentorías"],
    badge: "lider_zen",
  }
}

// ... Implementar funciones similares para todos los módulos y submódulos
// Módulo 2: Procesos y Sistemas
export function calcularNivelModulo2(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Reactivo",
      descripcion: "Procesos improvisados.",
      recomendaciones: ["Automatización sugerida", "Herramientas recomendadas", "Auditoría express"],
      badge: "procesos_reactivos",
    }
  if (percentage <= 50)
    return {
      nivel: "Manual",
      descripcion: "Procesos básicos documentados, mayormente manuales.",
      recomendaciones: ["Identificar automatización simple", "Estandarizar documentación"],
      badge: "procesos_manuales",
    }
  if (percentage <= 75)
    return {
      nivel: "Semi-Automatizado",
      descripcion: "Algunos procesos clave automatizados.",
      recomendaciones: ["Integrar sistemas", "Dashboards de monitoreo"],
      badge: "procesos_semi_auto",
    }
  return {
    nivel: "Optimizado",
    descripcion: "Procesos documentados, automatizados y en mejora continua.",
    recomendaciones: ["Implementar IA y ML", "Sistemas empresariales avanzados"],
    badge: "procesos_optimizados",
  }
}

// Módulo 3: Equipo y Cultura
export function calcularNivelModulo3(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Tóxica",
      descripcion: "Equipo no comprometido, cultura necesita atención.",
      recomendaciones: ["Acciones para elevar moral", "Cursos sugeridos", "Medidor de clima laboral"],
      badge: "cultura_toxica",
    }
  if (percentage <= 50)
    return {
      nivel: "Meh",
      descripcion: "Equipo presente pero no necesariamente comprometido.",
      recomendaciones: ["Programa de capacitación", "Feedback 360"],
      badge: "cultura_meh",
    }
  if (percentage <= 75)
    return {
      nivel: "Sana",
      descripcion: "Equipo comprometido, disfrutan trabajar.",
      recomendaciones: ["Mantener cultura positiva", "Programa de mentorías"],
      badge: "cultura_sana",
    }
  return {
    nivel: "Legendaria",
    descripcion: "Equipo ama trabajar aquí, embajadores de cultura.",
    recomendaciones: ["Documentar cultura para escalar", "Programa de referidos"],
    badge: "cultura_legendaria",
  }
}

// Módulo 4: Operaciones y Ejecución
export function calcularNivelModulo4(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 33)
    return {
      nivel: "Incendio diario",
      descripcion: "Operaciones impredecibles, problemas constantes.",
      recomendaciones: ["Template de KPIs por equipo", "Plan de revisión mensual"],
      badge: "ops_incendio",
    }
  if (percentage <= 66)
    return {
      nivel: "Estable",
      descripcion: "Operaciones funcionan con algunos contratiempos.",
      recomendaciones: ["Métricas de desempeño por área", "Sistema de mejora continua"],
      badge: "ops_estable",
    }
  return {
    nivel: "Óptimo",
    descripcion: "Operaciones predecibles, eficientes y bajo control.",
    recomendaciones: ["Automatización avanzada", "Inteligencia operativa"],
    badge: "ops_optimo",
  }
}

// Módulo 5: Ventas y Adquisición de Clientes - Submódulo 1: Embudo de ventas
export function calcularNivelModulo5Submodulo1(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Goteo",
      descripcion: "Proceso de ventas impredecible, pierdes oportunidades.",
      recomendaciones: ["Optimizar CTA", "Seguimiento", "Usar CRM sencillo"],
      badge: "embudo_goteo",
    }
  if (percentage <= 50)
    return {
      nivel: "Fuga",
      descripcion: "Proceso básico pero se escapan ventas.",
      recomendaciones: ["Automatizar seguimiento", "Scoring de prospectos"],
      badge: "embudo_fuga",
    }
  if (percentage <= 75)
    return {
      nivel: "Flujo",
      descripcion: "Proceso de ventas funciona bien.",
      recomendaciones: ["Optimizar cada etapa", "A/B testing"],
      badge: "embudo_flujo",
    }
  return {
    nivel: "Tubería turbo",
    descripcion: "Proceso altamente optimizado y automatizado.",
    recomendaciones: ["Predictive analytics", "Customer success program"],
    badge: "embudo_turbo",
  }
}

// Módulo 5: Ventas y Adquisición de Clientes - Submódulo 2: Clientes ideales y diferenciación
export function calcularNivelModulo5Submodulo2(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Invisible",
      descripcion: "Sin claridad en cliente ideal ni propuesta de valor.",
      recomendaciones: ["Crear elevator pitch", "Diferenciar visualmente con IA"],
      badge: "propuesta_invisible",
    }
  if (percentage <= 50)
    return {
      nivel: "Confusa",
      descripcion: "Idea básica pero propuesta no clara.",
      recomendaciones: ["Refinar propuesta de valor", "Materiales de ventas consistentes"],
      badge: "propuesta_confusa",
    }
  if (percentage <= 75)
    return {
      nivel: "Clara",
      descripcion: "Claridad sobre cliente y propuesta de valor.",
      recomendaciones: ["Optimizar messaging", "Contenido por buyer persona"],
      badge: "propuesta_clara",
    }
  return {
    nivel: "Irresistible",
    descripcion: "Propuesta de valor clara, diferenciada y atractiva.",
    recomendaciones: ["Documentar metodología", "Thought leadership"],
    badge: "propuesta_irresistible",
  }
}

// Módulo 6: Cultura y Propósito - Submódulo 1: Propósito personal del fundador
export function calcularNivelModulo6Submodulo1(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Desconectado",
      descripcion: "Pérdida de conexión con propósito original.",
      recomendaciones: ["IA propone declaración de propósito", "Hábitos para reconectar"],
      badge: "proposito_desconectado",
    }
  if (percentage <= 50)
    return {
      nivel: "En pausa",
      descripcion: "Propósito existe pero no se vive activamente.",
      recomendaciones: ["Integrar propósito en decisiones", "Comunicar propósito al equipo"],
      badge: "proposito_pausa",
    }
  if (percentage <= 75)
    return {
      nivel: "En camino",
      descripcion: "Trabajando en alinear negocio con propósito.",
      recomendaciones: ["Desarrollar misión clara", "Integrar propósito en cultura"],
      badge: "proposito_camino",
    }
  return {
    nivel: "Integrado",
    descripcion: "Propósito personal alineado con negocio.",
    recomendaciones: ["Compartir historia de propósito", "Crear movimiento"],
    badge: "proposito_integrado",
  }
}

// Módulo 6: Cultura y Propósito - Submódulo 2: Cultura interna
export function calcularNivelModulo6Submodulo2(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Tóxica",
      descripcion: "Ambiente negativo y contraproducente.",
      recomendaciones: ["IA recomienda: valores personalizados", "Eventos internos", "Muro digital de cultura"],
      badge: "cultura_interna_toxica",
    }
  if (percentage <= 50)
    return {
      nivel: "Tibia",
      descripcion: "Ambiente neutral, ni bueno ni malo.",
      recomendaciones: ["Definir valores claros", "Team building"],
      badge: "cultura_interna_tibia",
    }
  if (percentage <= 75)
    return {
      nivel: "Activa",
      descripcion: "Cultura positiva y activa.",
      recomendaciones: ["Documentar cultura", "Embajadores culturales"],
      badge: "cultura_interna_activa",
    }
  return {
    nivel: "Épica",
    descripcion: "Cultura extraordinaria, diferenciador competitivo.",
    recomendaciones: ["Compartir cultura como case study", "Libro de cultura"],
    badge: "cultura_interna_epica",
  }
}

// Módulo 7: Legal & Compliance - Submódulo 1: Formalidad legal
export function calcularNivelModulo7Submodulo1(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 33)
    return {
      nivel: "Alto Riesgo",
      descripcion: "Alta exposición a riesgos legales.",
      recomendaciones: ["Lista de cumplimiento", "Contratos automáticos con IA legal"],
      badge: "legal_alto_riesgo",
    }
  if (percentage <= 66)
    return {
      nivel: "Medio Riesgo",
      descripcion: "Cumplimiento parcial, áreas de mejora.",
      recomendaciones: ["Revisar contratos existentes", "Formalizar equipo"],
      badge: "legal_medio_riesgo",
    }
  return {
    nivel: "Bajo Riesgo",
    descripcion: "Buen nivel de formalidad y cumplimiento.",
    recomendaciones: ["Mantener actualización legal", "Auditorías preventivas"],
    badge: "legal_bajo_riesgo",
  }
}

// Módulo 7: Legal & Compliance - Submódulo 2: Cumplimiento fiscal
export function calcularNivelModulo7Submodulo2(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Peligro Fiscal",
      descripcion: "Alto riesgo de problemas fiscales.",
      recomendaciones: ["Checklist fiscal", "Asesoría o software contable"],
      badge: "fiscal_peligro",
    }
  if (percentage <= 50)
    return {
      nivel: "Gris Fiscal",
      descripcion: "Cumplimiento irregular, posible evasión.",
      recomendaciones: ["Regularizar situación fiscal", "Implementar sistema contable"],
      badge: "fiscal_gris",
    }
  if (percentage <= 75)
    return {
      nivel: "Ordenado Fiscal",
      descripcion: "Buen manejo fiscal, pero puede mejorar.",
      recomendaciones: ["Optimizar planeación fiscal", "Dashboard fiscal"],
      badge: "fiscal_ordenado",
    }
  return {
    nivel: "Legalmente Pro Fiscal",
    descripcion: "Cumplimiento fiscal robusto y al día.",
    recomendaciones: ["Mantenerse actualizado en normativas", "Auditorías fiscales periódicas"],
    badge: "fiscal_pro",
  }
}

// Módulo 8: Tecnología y Digitalización
export function calcularNivelModulo8(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Análogo",
      descripcion: "Bajo uso de herramientas digitales.",
      recomendaciones: ["Herramientas por etapa", "Mapa de automatizaciones", "Entrenamiento básico"],
      badge: "digital_analogo",
    }
  if (percentage <= 50)
    return {
      nivel: "Básico Digital",
      descripcion: "Uso de herramientas básicas, poca automatización.",
      recomendaciones: ["Implementar CRM", "Automatizar tareas repetitivas"],
      badge: "digital_basico",
    }
  if (percentage <= 75)
    return {
      nivel: "Intermedio Digital",
      descripcion: "Buen uso de tecnología, algunas automatizaciones.",
      recomendaciones: ["Integrar sistemas", "Políticas de ciberseguridad"],
      badge: "digital_intermedio",
    }
  return {
    nivel: "Ninja Digital",
    descripcion: "Alto nivel de digitalización y automatización.",
    recomendaciones: ["Explorar IA y ML", "Optimizar ciberseguridad"],
    badge: "digital_ninja",
  }
}

// Módulo 9: Expansión y Escalabilidad
export function calcularNivelModulo9(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Localito",
      descripcion: "Operación difícil de replicar, enfocado localmente.",
      recomendaciones: ["Checklist de replicación", "Validación de mercado nuevo", "Estrategia por ciudad"],
      badge: "escala_local",
    }
  if (percentage <= 50)
    return {
      nivel: "Escalable con Esfuerzo",
      descripcion: "Potencial de escalar pero requiere ajustes.",
      recomendaciones: ["Documentar procesos para replicar", "Plan de expansión gradual"],
      badge: "escala_esfuerzo",
    }
  if (percentage <= 75)
    return {
      nivel: "Multiplicable",
      descripcion: "Procesos listos para replicar, con plan de expansión.",
      recomendaciones: ["Optimizar para nuevos mercados", "Estrategia de internacionalización"],
      badge: "escala_multiplica",
    }
  return {
    nivel: "BoomExpansion",
    descripcion: "Listo para escalar masivamente, incluso internacionalmente.",
    recomendaciones: ["Modelo de franquicia o licencia", "Adquisiciones estratégicas"],
    badge: "escala_boom",
  }
}

// Módulo 10: Product-Market Fit
export function calcularNivelModulo10(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Idea Buena",
      descripcion: "Producto/servicio con potencial pero poca validación.",
      recomendaciones: ["Estrategia de retención", "Embudo optimizado", "Referral gamificado"],
      badge: "pmf_idea",
    }
  if (percentage <= 50)
    return {
      nivel: "Aceptable",
      descripcion: "Clientes satisfechos, pero puede mejorar la conexión.",
      recomendaciones: ["Encuestas de satisfacción profundas", "Optimizar propuesta de valor"],
      badge: "pmf_aceptable",
    }
  if (percentage <= 75)
    return {
      nivel: "Conectado",
      descripcion: "Buen product-market fit, clientes leales.",
      recomendaciones: ["Programa de embajadores", "Desarrollar comunidad"],
      badge: "pmf_conectado",
    }
  return {
    nivel: "Inlove Total",
    descripcion: "Producto/servicio indispensable para tus clientes.",
    recomendaciones: ["Expandir a nichos adyacentes", "Innovación continua basada en feedback"],
    badge: "pmf_inlove",
  }
}

// Módulo 11: Servicio al Cliente
export function calcularNivelModulo11(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Incendios Diarios",
      descripcion: "Servicio al cliente reactivo y con problemas.",
      recomendaciones: ["Sistema de tickets", "Scripts de atención", "Dashboard de satisfacción"],
      badge: "servicio_incendios",
    }
  if (percentage <= 50)
    return {
      nivel: "Atento",
      descripcion: "Buena atención pero puede ser más proactiva.",
      recomendaciones: ["Protocolos de quejas", "Encuestas de satisfacción"],
      badge: "servicio_atento",
    }
  if (percentage <= 75)
    return {
      nivel: "Proactivo",
      descripcion: "Servicio al cliente proactivo y eficiente.",
      recomendaciones: ["Implementar CRM para seguimiento", "Programa de fidelización"],
      badge: "servicio_proactivo",
    }
  return {
    nivel: "Wow Experience",
    descripcion: "Experiencia de cliente excepcional y diferenciadora.",
    recomendaciones: ["Personalización avanzada", "Anticipación de necesidades"],
    badge: "servicio_wow",
  }
}

// Módulo 12: OKRs y KPIs por Área - Submódulo 1: Objetivos por área
export function calcularNivelModulo12Submodulo1(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Nulo",
      descripcion: "Sin objetivos claros por área.",
      recomendaciones: ["Plantilla de OKRs por área", "Tablero visual editable"],
      badge: "okr_nulo",
    }
  if (percentage <= 50)
    return {
      nivel: "Reactivo",
      descripcion: "Objetivos definidos informalmente o solo en ventas.",
      recomendaciones: ["Establecer OKRs trimestrales", "Reuniones de seguimiento"],
      badge: "okr_reactivo",
    }
  if (percentage <= 75)
    return {
      nivel: "Parcial",
      descripcion: "Algunas áreas con OKRs, seguimiento irregular.",
      recomendaciones: ["Sistema de definición conjunta", "Revisión semanal de avances"],
      badge: "okr_parcial",
    }
  return {
    nivel: "Estratégico",
    descripcion: "Gestión por objetivos clara y sistemática en todas las áreas.",
    recomendaciones: ["Alinear OKRs con visión a largo plazo", "Cascada de objetivos"],
    badge: "okr_estrategico",
  }
}

// Módulo 12: OKRs y KPIs por Área - Submódulo 2: Indicadores clave (KPIs)
export function calcularNivelModulo12Submodulo2(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Ciego",
      descripcion: "Sin indicadores clave o solo ventas.",
      recomendaciones: ["Dashboard automatizado", "Protocolo de seguimiento", "Sistema de accountability"],
      badge: "kpi_ciego",
    }
  if (percentage <= 50)
    return {
      nivel: "Visor",
      descripcion: "Algunos KPIs pero no se usan activamente.",
      recomendaciones: ["Integrar KPIs en reportes", "Capacitar al equipo en KPIs"],
      badge: "kpi_visor",
    }
  if (percentage <= 75)
    return {
      nivel: "Observador",
      descripcion: "KPIs definidos y compartidos, pero falta acción.",
      recomendaciones: ["Protocolos de ajuste para KPIs", "Revisión en equipo"],
      badge: "kpi_observador",
    }
  return {
    nivel: "Data Driven",
    descripcion: "Decisiones basadas en datos, KPIs integrados en la cultura.",
    recomendaciones: ["Implementar Business Intelligence", "KPIs predictivos"],
    badge: "kpi_data_driven",
  }
}

// Módulo 13: Propósito Final y Equilibrio Personal del Fundador
export function calcularNivelModulo13(score: number, maxScore: number): NivelResultado {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25)
    return {
      nivel: "Quemado",
      descripcion: "Alto estrés y desequilibrio vida-trabajo.",
      recomendaciones: ["Plan de equilibrio", "Alertas de burnout", "Hábitos diarios sugeridos"],
      badge: "bienestar_quemado",
    }
  if (percentage <= 50)
    return {
      nivel: "En la Cuerda",
      descripcion: "Estrés considerable, equilibrio frágil.",
      recomendaciones: ["Establecer límites claros", "Delegar más tareas"],
      badge: "bienestar_cuerda",
    }
  if (percentage <= 75)
    return {
      nivel: "Balanceado",
      descripcion: "Buen equilibrio, gestiona bien el estrés.",
      recomendaciones: ["Mantener hábitos saludables", "Mentoría para fundadores"],
      badge: "bienestar_balanceado",
    }
  return {
    nivel: "Inspirado",
    descripcion: "Plenitud, paz y sentido en el trabajo y vida personal.",
    recomendaciones: ["Compartir prácticas de bienestar", "Liderar con ejemplo"],
    badge: "bienestar_inspirado",
  }
}

// Función general para obtener el cálculo de nivel (puedes expandirla o refactorizarla)
export function getNivelYRecomendaciones(
  moduleId: string,
  submoduleId: string | null,
  score: number,
  maxScore: number,
): NivelResultado | null {
  if (moduleId === "modulo1_org_roles") {
    if (submoduleId === "sub1_1_estructura") return calcularNivelModulo1Submodulo1(score, maxScore)
    if (submoduleId === "sub1_2_liderazgo") return calcularNivelModulo1Submodulo2(score, maxScore)
  }
  if (moduleId === "modulo2_procesos_sistemas") return calcularNivelModulo2(score, maxScore)
  if (moduleId === "modulo3_equipo_cultura") return calcularNivelModulo3(score, maxScore)
  if (moduleId === "modulo4_operaciones_ejecucion") return calcularNivelModulo4(score, maxScore)
  if (moduleId === "modulo5_ventas_adquisicion") {
    if (submoduleId === "sub5_1_embudo_ventas") return calcularNivelModulo5Submodulo1(score, maxScore)
    if (submoduleId === "sub5_2_clientes_diferenciacion") return calcularNivelModulo5Submodulo2(score, maxScore)
  }
  if (moduleId === "modulo6_cultura_proposito") {
    if (submoduleId === "sub6_1_proposito_fundador") return calcularNivelModulo6Submodulo1(score, maxScore)
    if (submoduleId === "sub6_2_cultura_interna") return calcularNivelModulo6Submodulo2(score, maxScore)
  }
  if (moduleId === "modulo7_legal_compliance") {
    if (submoduleId === "sub7_1_formalidad_legal") return calcularNivelModulo7Submodulo1(score, maxScore)
    if (submoduleId === "sub7_2_cumplimiento_fiscal") return calcularNivelModulo7Submodulo2(score, maxScore)
  }
  if (moduleId === "modulo8_tecnologia_digitalizacion") return calcularNivelModulo8(score, maxScore)
  if (moduleId === "modulo9_expansion_escalabilidad") return calcularNivelModulo9(score, maxScore)
  if (moduleId === "modulo10_product_market_fit") return calcularNivelModulo10(score, maxScore)
  if (moduleId === "modulo11_servicio_cliente") return calcularNivelModulo11(score, maxScore)
  if (moduleId === "modulo12_okrs_kpis") {
    if (submoduleId === "sub12_1_objetivos_area") return calcularNivelModulo12Submodulo1(score, maxScore)
    if (submoduleId === "sub12_2_kpis") return calcularNivelModulo12Submodulo2(score, maxScore)
  }
  if (moduleId === "modulo13_proposito_equilibrio") return calcularNivelModulo13(score, maxScore)

  // Placeholder para módulos no implementados aún
  return {
    nivel: "En Desarrollo",
    descripcion: "Resultados para este módulo estarán disponibles pronto.",
    recomendaciones: ["Sigue explorando otros módulos."],
  }
}

// Funciones auxiliares para compatibilidad con el código existente
export function calculateLevel(percentage: number): string {
  if (percentage <= 25) return "BoomTyrant"
  if (percentage <= 50) return "BoomBoss"
  if (percentage <= 75) return "BoomMaster"
  return "BoomZen"
}

export function getLevelRecommendations(level: string): string[] {
  switch (level) {
    case "BoomTyrant":
      return [
        "Implementar procesos básicos de gestión",
        "Establecer comunicación regular con el equipo",
        "Definir roles y responsabilidades claras",
      ]
    case "BoomBoss":
      return [
        "Mejorar la delegación de tareas",
        "Implementar sistemas de seguimiento",
        "Desarrollar habilidades de liderazgo",
      ]
    case "BoomMaster":
      return [
        "Optimizar procesos existentes",
        "Implementar métricas de desempeño",
        "Fomentar la innovación en el equipo",
      ]
    case "BoomZen":
      return [
        "Mantener la excelencia operativa",
        "Compartir mejores prácticas",
        "Liderar la transformación organizacional",
      ]
    default:
      return ["Continuar evaluando para obtener recomendaciones específicas"]
  }
}
