import type { MegaModule } from "@/types/mega-diagnostic"

// Contenido actualizado según el nuevo texto proporcionado por el usuario para los módulos 1 al 13.
// Se mantiene la estructura, pero se ajusta el texto de preguntas y opciones.
// Se eliminan las propiedades 'justificacion'.
export const etapa2Modulos: MegaModule[] = [
  // MÓDULO 1: ORGANIZACIÓN Y ROLES
  {
    id: "modulo1_org_roles",
    titulo: "MÓDULO 1: ORGANIZACIÓN Y ROLES",
    icon: "Users",
    submodules: [
      {
        id: "sub1_1_estructura",
        titulo: "Submódulo 1: Estructura actual",
        preguntas: [
          {
            id: "m1s1q1",
            pregunta: "¿Cómo describirías el organigrama de tu empresa en la actualidad?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No existe de forma formal", ponderacion: 1 },
              { id: "o2", text: "Yo asumo la mayoría de las funciones", ponderacion: 2 },
              { id: "o3", text: "Hay roles, pero no muy definidos", ponderacion: 3 },
              { id: "o4", text: "Existe una estructura clara y cada persona conoce su función", ponderacion: 4 },
            ],
          },
          {
            id: "m1s1q2",
            pregunta: "¿Quién toma las decisiones clave en la empresa?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Yo solo", ponderacion: 1 },
              { id: "o2", text: "Mi socio(a) y yo (con ciertas fricciones)", ponderacion: 2 },
              { id: "o3", text: "Un equipo o comité", ponderacion: 4 },
              { id: "o4", text: "No existe claridad al respecto", ponderacion: 0 },
            ],
          },
          {
            id: "m1s1q3",
            pregunta: "¿Tus colaboradores conocen las metas y responsabilidades que les corresponden?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Sí, cada uno tiene objetivos claros", ponderacion: 4 },
              { id: "o2", text: "Más o menos, seguimos improvisando", ponderacion: 2 },
              { id: "o3", text: "No, todos hacen diversas tareas sin un plan", ponderacion: 1 },
              { id: "o4", text: "Solo yo sé los objetivos concretos", ponderacion: 1 },
            ],
          },
        ],
      },
      {
        id: "sub1_2_liderazgo",
        titulo: "Submódulo 2: Delegación y liderazgo",
        preguntas: [
          {
            id: "m1s2q1",
            pregunta: "¿Qué nivel de delegación manejas?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Realizo prácticamente todas las actividades", ponderacion: 1 },
              { id: "o2", text: "Delego, pero reviso todos los detalles", ponderacion: 2 },
              { id: "o3", text: "Existen líderes responsables de cada área", ponderacion: 4 },
              { id: "o4", text: "Me dedico a dirigir o vender, delegando el resto", ponderacion: 3 },
            ],
          },
          {
            id: "m1s2q2",
            pregunta: "¿Cuál es tu estilo de liderazgo?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Estricto y apresurado", ponderacion: 1 },
              { id: "o2", text: "Amigable, pero con desorganización", ponderacion: 2 },
              { id: "o3", text: "Visionario y centrado en objetivos", ponderacion: 3 },
              { id: "o4", text: "Mentor con un método establecido", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 2: PROCESOS Y SISTEMAS
  {
    id: "modulo2_procesos_sistemas",
    titulo: "MÓDULO 2: PROCESOS Y SISTEMAS",
    icon: "Settings",
    submodules: [
      {
        id: "sub2_1_procesos",
        titulo: "Procesos y Sistemas", // El texto del usuario no especifica submódulo, asumo uno general.
        preguntas: [
          {
            id: "m2s1q1",
            pregunta: "¿Tienes procesos documentados en tu empresa?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Están en mi cabeza solamente", ponderacion: 1 },
              { id: "o2", text: "Hay algunos SOPs en Word o Notion", ponderacion: 2 },
              { id: "o3", text: "La mayoría están en video o tutoriales", ponderacion: 3 },
              { id: "o4", text: "Empleo herramientas y listas de verificación con el equipo", ponderacion: 4 },
            ],
          },
          {
            id: "m2s1q2",
            pregunta: "¿En qué áreas se presentan mayores cuellos de botella? (Multiples opciones)",
            ponderacionPregunta: 1,
            tipo: "multiple",
            opciones: [
              { id: "o1", text: "Producción o prestación de servicios", ponderacion: 1 },
              { id: "o2", text: "Atención al cliente", ponderacion: 1 },
              { id: "o3", text: "Entregas o logística", ponderacion: 1 },
              { id: "o4", text: "Reportes o controles financieros", ponderacion: 1 },
              { id: "o5", text: "Actividades menores que consumen tiempo", ponderacion: 1 },
            ],
          },
          {
            id: "m2s1q3",
            pregunta: "¿Con qué frecuencia revisas o mejoras tus procesos?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Nunca", ponderacion: 1 },
              { id: "o2", text: "Solo cuando el problema ya es evidente", ponderacion: 2 },
              { id: "o3", text: "Cada trimestre o periodo similar", ponderacion: 3 },
              { id: "o4", text: "Sigo un método de mejora continua", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 3: EQUIPO Y CULTURA
  {
    id: "modulo3_equipo_cultura",
    titulo: "MÓDULO 3: EQUIPO Y CULTURA",
    icon: "Heart",
    submodules: [
      {
        id: "sub3_1_equipo_cultura", // Asumo un submódulo general
        titulo: "Equipo y Cultura",
        preguntas: [
          {
            id: "m3s1q1",
            pregunta: "¿Cómo percibes la motivación de tu equipo?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No estoy seguro", ponderacion: 1 },
              { id: "o2", text: "Trabajan solo por el salario", ponderacion: 2 },
              { id: "o3", text: "Se nota un compromiso constante", ponderacion: 3 },
              { id: "o4", text: "Están muy entusiasmados con la misión", ponderacion: 4 },
            ],
          },
          {
            id: "m3s1q2",
            pregunta: "¿Cuentas con un sistema de retroalimentación o clima laboral?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Desconozco el tema", ponderacion: 1 },
              { id: "o2", text: "Solo reaccionamos cuando surgen conflictos", ponderacion: 2 },
              { id: "o3", text: "Hacemos conversaciones informales", ponderacion: 3 },
              { id: "o4", text: "Sí, tenemos evaluaciones regulares de clima", ponderacion: 4 },
            ],
          },
          {
            id: "m3s1q3",
            pregunta: "¿Inviertes en la capacitación de tu equipo?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, aprenden sobre la marcha", ponderacion: 1 },
              { id: "o2", text: "Comparto videos y recursos ocasionales", ponderacion: 2 },
              { id: "o3", text: "Sí, al menos mensualmente o trimestralmente", ponderacion: 3 },
              { id: "o4", text: "Cada persona tiene un plan de desarrollo definido", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 4: OPERACIONES Y EJECUCIÓN
  {
    id: "modulo4_operaciones_ejecucion",
    titulo: "MÓDULO 4: OPERACIONES Y EJECUCIÓN",
    icon: "Activity",
    submodules: [
      {
        id: "sub4_1_operaciones_ejecucion", // Asumo un submódulo general
        titulo: "Operaciones y Ejecución",
        preguntas: [
          {
            id: "m4s1q1",
            pregunta: "¿Cuántos días a la semana funciona todo sin contratiempos significativos?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Nunca", ponderacion: 1 },
              { id: "o2", text: "1 o 2", ponderacion: 2 },
              { id: "o3", text: "La mayoría", ponderacion: 3 },
              { id: "o4", text: "Todos los días", ponderacion: 4 },
            ],
          },
          {
            id: "m4s1q2",
            pregunta: "¿La operación diaria es predecible o está sujeta a muchos imprevistos?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Sumamente impredecible", ponderacion: 1 },
              { id: "o2", text: "Hay algo de orden, pero se improvisa", ponderacion: 2 },
              { id: "o3", text: "Contamos con calendarios y cronogramas", ponderacion: 3 },
              { id: "o4", text: "Seguimos procesos con puntualidad", ponderacion: 4 },
            ],
          },
          {
            id: "m4s1q3",
            pregunta: "¿Tienes indicadores de ejecución para cada área?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No manejo ninguno", ponderacion: 1 },
              { id: "o2", text: "Solo en el área de ventas", ponderacion: 2 },
              { id: "o3", text: "Por área, con seguimiento periódico", ponderacion: 3 },
              { id: "o4", text: "Empleo tableros automáticos (dashboards)", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 5: VENTAS Y ADQUISICIÓN DE CLIENTES
  {
    id: "modulo5_ventas_adquisicion",
    titulo: "MÓDULO 5: VENTAS Y ADQUISICIÓN DE CLIENTES",
    icon: "TrendingUp",
    submodules: [
      {
        id: "sub5_1_embudo_ventas",
        titulo: "Submódulo 1: Embudo de ventas",
        preguntas: [
          {
            id: "m5s1q1",
            pregunta: "¿Tienes definido el proceso desde que el cliente te conoce hasta que compra?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, a veces llegan por casualidad", ponderacion: 1 },
              { id: "o2", text: "Tengo una idea en mente", ponderacion: 2 },
              { id: "o3", text: "Hay un embudo, pero con problemas en ciertas etapas", ponderacion: 3 },
              { id: "o4", text: "Está completamente automatizado y medido", ponderacion: 4 },
            ],
          },
          {
            id: "m5s1q2",
            pregunta: "¿En qué etapa pierdes más ventas? (Varias opciones)",
            ponderacionPregunta: 1,
            tipo: "multiple",
            opciones: [
              { id: "o1", text: "No me contactan", ponderacion: 1 },
              { id: "o2", text: "Preguntan, pero no confirman", ponderacion: 1 },
              { id: "o3", text: "Reciben cotización y no pagan", ponderacion: 1 },
              { id: "o4", text: "Compran una vez y no vuelven", ponderacion: 1 },
              { id: "o5", text: "No sé en qué punto se pierden", ponderacion: 1 },
            ],
          },
          {
            id: "m5s1q3",
            pregunta: "¿De cada 10 personas interesadas, cuántas terminan comprando?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "0–2", ponderacion: 1 },
              { id: "o2", text: "3–5", ponderacion: 2 },
              { id: "o3", text: "6–8", ponderacion: 3 },
              { id: "o4", text: "9–10", ponderacion: 4 },
            ],
          },
        ],
      },
      {
        id: "sub5_2_clientes_diferenciacion",
        titulo: "Submódulo 2: Clientes ideales y diferenciación",
        preguntas: [
          {
            id: "m5s2q1",
            pregunta: "¿Tienes identificado tu cliente ideal?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No lo tengo claro", ponderacion: 1 },
              { id: "o2", text: "Cualquiera que pague", ponderacion: 2 },
              { id: "o3", text: "Tengo un perfil básico definido", ponderacion: 3 },
              { id: "o4", text: "Sé exactamente quién es y cómo atraerlo", ponderacion: 4 },
            ],
          },
          {
            id: "m5s2q2",
            pregunta: "¿Por qué te comprarían a ti en lugar de a la competencia? (Varias opciones)",
            ponderacionPregunta: 1,
            tipo: "multiple",
            opciones: [
              { id: "o1", text: "Ofrezco precios más bajos", ponderacion: 1 },
              { id: "o2", text: "Mejor atención personalizada", ponderacion: 2 },
              { id: "o3", text: "Entrego con mayor rapidez", ponderacion: 2 },
              { id: "o4", text: "Genero más valor agregado", ponderacion: 3 },
              { id: "o5", text: "No estoy seguro", ponderacion: 0 },
            ],
          },
          {
            id: "m5s2q3",
            pregunta: "¿Tu propuesta de valor está claramente definida?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Desconozco el concepto", ponderacion: 1 },
              { id: "o2", text: "Está difusa", ponderacion: 2 },
              { id: "o3", text: "Tengo un discurso de ventas que la explica", ponderacion: 3 },
              { id: "o4", text: "La comunico con eficacia y el mercado la comprende", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 6: CULTURA Y PROPÓSITO
  {
    id: "modulo6_cultura_proposito",
    titulo: "MÓDULO 6: CULTURA Y PROPÓSITO",
    icon: "Compass",
    submodules: [
      {
        id: "sub6_1_proposito_fundador",
        titulo: "Submódulo 1: Propósito personal del fundador",
        preguntas: [
          {
            id: "m6s1q1",
            pregunta: "¿Qué motivaciones te llevaron a emprender? (Máx 3)",
            ponderacionPregunta: 1,
            tipo: "multiple",
            opciones: [
              { id: "o1", text: "Escapar de un trabajo rutinario", ponderacion: 1 },
              { id: "o2", text: "Mejorar la vida de mi familia", ponderacion: 2 },
              { id: "o3", text: "Tener libertad plena", ponderacion: 2 },
              { id: "o4", text: "Crear algo innovador", ponderacion: 3 },
              { id: "o5", text: "Probar mis capacidades", ponderacion: 2 },
              { id: "o6", text: "Cambiar algo en el mundo", ponderacion: 3 },
            ],
          },
          {
            id: "m6s1q2",
            pregunta: "¿Tu propósito inicial sigue vigente?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Apenas lo recuerdo", ponderacion: 1 },
              { id: "o2", text: "Algo, aunque me siento desanimado", ponderacion: 2 },
              { id: "o3", text: "Sí, aunque a veces se me olvida", ponderacion: 3 },
              { id: "o4", text: "Por completo, es mi motor diario", ponderacion: 4 },
            ],
          },
          {
            id: "m6s1q3",
            pregunta: "¿Te gustaría alinear tu negocio con tu propósito personal?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, lo importante es vender", ponderacion: 1 },
              { id: "o2", text: "Sería un gran paso", ponderacion: 3 },
              { id: "o3", text: "Claro, para eso empecé", ponderacion: 4 },
            ],
          },
        ],
      },
      {
        id: "sub6_2_cultura_interna",
        titulo: "Submódulo 2: Cultura interna",
        preguntas: [
          {
            id: "m6s2q1",
            pregunta: "¿Cómo describirías el ambiente en tu empresa?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Conflictos frecuentes, un tanto caótico", ponderacion: 1 },
              { id: "o2", text: "Relajado, pero con baja productividad", ponderacion: 2 },
              { id: "o3", text: "Profesional y con buen ambiente", ponderacion: 3 },
              { id: "o4", text: "Muy sólido, con una cultura distintiva", ponderacion: 4 },
            ],
          },
          {
            id: "m6s2q2",
            pregunta: "¿Existen rituales o prácticas que fortalezcan la cultura?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Ninguno formal", ponderacion: 1 },
              { id: "o2", text: "Celebraciones puntuales (cumpleaños, café)", ponderacion: 2 },
              { id: "o3", text: "Algunos eventos o ceremonias", ponderacion: 3 },
              { id: "o4", text: "Cultura documentada y viva", ponderacion: 4 },
            ],
          },
          {
            id: "m6s2q3",
            pregunta: "¿Con qué frecuencia se hablan o refuerzan los valores de la empresa?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Nunca se mencionan", ponderacion: 1 },
              { id: "o2", text: "Están en un póster sin revisarse", ponderacion: 2 },
              { id: "o3", text: "A veces se mencionan en reuniones", ponderacion: 3 },
              { id: "o4", text: "Son parte de la rutina y comportamiento diario", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 7: LEGAL & COMPLIANCE
  {
    id: "modulo7_legal_compliance",
    titulo: "MÓDULO 7: LEGAL & COMPLIANCE",
    icon: "Scale",
    submodules: [
      {
        id: "sub7_1_formalidad_legal",
        titulo: "Submódulo 1: Formalidad legal",
        preguntas: [
          {
            id: "m7s1q1",
            pregunta: "¿Tu negocio está legalmente constituido?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Opero informalmente", ponderacion: 1 },
              { id: "o2", text: "Persona física con actividad empresarial", ponderacion: 2 },
              { id: "o3", text: "Cuento con sociedad (SA, SAS, SAPI)", ponderacion: 3 },
              { id: "o4", text: "Todo está en regla, con obligaciones al día", ponderacion: 4 },
            ],
          },
          {
            id: "m7s1q2",
            pregunta: "¿Tienes contratos con tus clientes o proveedores?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Solo acuerdos verbales", ponderacion: 1 },
              { id: "o2", text: "Uso plantillas genéricas de internet", ponderacion: 2 },
              { id: "o3", text: "Contratos revisados por un abogado", ponderacion: 3 },
              { id: "o4", text: "Todo se firma digitalmente de forma legal", ponderacion: 4 },
            ],
          },
          {
            id: "m7s1q3",
            pregunta: "¿Tu equipo está formalizado según la ley laboral?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, son acuerdos informales", ponderacion: 1 },
              { id: "o2", text: "Algunos sí, otros no", ponderacion: 2 },
              { id: "o3", text: "Todos están dados de alta y cubiertos legalmente", ponderacion: 4 },
            ],
          },
        ],
      },
      {
        id: "sub7_2_cumplimiento_fiscal",
        titulo: "Submódulo 2: Cumplimiento fiscal",
        preguntas: [
          {
            id: "m7s2q1",
            pregunta: "¿Facturas la mayoría de tus ventas?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Casi no facturo", ponderacion: 1 },
              { id: "o2", text: "Solo cuando el cliente lo pide", ponderacion: 2 },
              { id: "o3", text: "Facturo la mayor parte", ponderacion: 3 },
              { id: "o4", text: "Declaro todo ante la autoridad", ponderacion: 4 },
            ],
          },
          {
            id: "m7s2q2",
            pregunta: "¿Haces pagos provisionales y declaración mensual de impuestos?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No conozco el proceso", ponderacion: 1 },
              { id: "o2", text: "A veces los hago con retraso", ponderacion: 2 },
              { id: "o3", text: "Tengo un contador que me apoya", ponderacion: 3 },
              { id: "o4", text: "Todo está al día con un sistema fiscal", ponderacion: 4 },
            ],
          },
          {
            id: "m7s2q3",
            pregunta: "¿Existen riesgos de evasión o incumplimiento fiscal?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Sí, y me preocupa", ponderacion: 1 },
              { id: "o2", text: "Podría haber, no lo he revisado", ponderacion: 2 },
              { id: "o3", text: "Son mínimos", ponderacion: 3 },
              { id: "o4", text: "Estoy cubierto legalmente", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 8: TECNOLOGÍA Y DIGITALIZACIÓN
  {
    id: "modulo8_tecnologia_digitalizacion",
    titulo: "MÓDULO 8: TECNOLOGÍA Y DIGITALIZACIÓN",
    icon: "Laptop",
    submodules: [
      {
        id: "sub8_1_herramientas_digitales",
        titulo: "Submódulo 1: Nivel de herramientas digitales",
        preguntas: [
          {
            id: "m8s1q1",
            pregunta: "¿Qué sistemas utilizas para administrar tu negocio? (Múltiples)",
            ponderacionPregunta: 1,
            tipo: "multiple",
            opciones: [
              { id: "o1", text: "Excel y WhatsApp", ponderacion: 1 },
              { id: "o2", text: "Aplicaciones de organización (Notion, Trello, etc.)", ponderacion: 2 },
              { id: "o3", text: "CRM (HubSpot, Zoho, etc.)", ponderacion: 3 },
              { id: "o4", text: "ERP o sistema especializado", ponderacion: 4 },
              { id: "o5", text: "Nada, todo manual", ponderacion: 0 },
            ],
          },
          {
            id: "m8s1q2",
            pregunta: "¿Automatizas tareas repetitivas?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, todo manual", ponderacion: 1 },
              { id: "o2", text: "Algunas cosas con Zapier o bots", ponderacion: 2 },
              { id: "o3", text: "Varias funciones están automatizadas", ponderacion: 3 },
              { id: "o4", text: "Todo está orquestado y sincronizado", ponderacion: 4 },
            ],
          },
          {
            id: "m8s1q3",
            pregunta: "¿Cuentas con respaldo de datos y seguridad digital?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Nunca lo he pensado", ponderacion: 1 },
              { id: "o2", text: "Solo en la nube (Drive, Dropbox)", ponderacion: 2 },
              { id: "o3", text: "Hago copias de seguridad periódicas", ponderacion: 3 },
              { id: "o4", text: "Tengo políticas de ciberseguridad establecidas", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 9: EXPANSIÓN Y ESCALABILIDAD
  {
    id: "modulo9_expansion_escalabilidad",
    titulo: "MÓDULO 9: EXPANSIÓN Y ESCALABILIDAD",
    icon: "Globe",
    submodules: [
      {
        id: "sub9_1_preparacion_crecer",
        titulo: "Submódulo 1: Preparación para crecer",
        preguntas: [
          {
            id: "m9s1q1",
            pregunta: "¿Podrías abrir otra sucursal o aumentar ventas sin que tu negocio colapse?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, es inviable", ponderacion: 1 },
              { id: "o2", text: "Sería complicado, pero posible", ponderacion: 2 },
              { id: "o3", text: "Sí, con algo de ayuda", ponderacion: 3 },
              { id: "o4", text: "Estoy listo para escalar ahora mismo", ponderacion: 4 },
            ],
          },
          {
            id: "m9s1q2",
            pregunta: "¿Tus procesos están diseñados para replicarse?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Dependemos demasiado de mí", ponderacion: 1 },
              { id: "o2", text: "Algunos sí, otros no", ponderacion: 2 },
              { id: "o3", text: "Tengo manuales y SOPs básicos", ponderacion: 3 },
              { id: "o4", text: "Cualquier persona podría replicarlo con el material existente", ponderacion: 4 },
            ],
          },
          {
            id: "m9s1q3",
            pregunta: "¿Has contemplado escalar fuera de tu ciudad o país?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Solo un sueño", ponderacion: 1 },
              { id: "o2", text: "Suena complejo, pero me interesa", ponderacion: 2 },
              { id: "o3", text: "Ya trabajo en un plan", ponderacion: 3 },
              { id: "o4", text: "Estoy en pleno proceso de expansión", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 10: PRODUCT-MARKET FIT
  {
    id: "modulo10_product_market_fit",
    titulo: "MÓDULO 10: PRODUCT-MARKET FIT",
    icon: "Puzzle",
    submodules: [
      {
        id: "sub10_1_validacion_satisfaccion",
        titulo: "Submódulo 1: Validación y satisfacción",
        preguntas: [
          {
            id: "m10s1q1",
            pregunta: "¿Con qué frecuencia tus clientes repiten o recomiendan tu servicio/producto?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Muy pocos", ponderacion: 1 },
              { id: "o2", text: "A veces", ponderacion: 2 },
              { id: "o3", text: "La mayoría", ponderacion: 3 },
              { id: "o4", text: "Me llegan referidos de forma constante", ponderacion: 4 },
            ],
          },
          {
            id: "m10s1q2",
            pregunta: "¿Has realizado encuestas o entrevistas formales a clientes?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Nunca", ponderacion: 1 },
              { id: "o2", text: "Solo de manera superficial", ponderacion: 2 },
              { id: "o3", text: "Sí, obtuve información valiosa", ponderacion: 3 },
              { id: "o4", text: "Tengo datos y entrevistas grabadas y analizadas", ponderacion: 4 },
            ],
          },
          {
            id: "m10s1q3",
            pregunta: "¿Tu oferta soluciona una necesidad real del mercado?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Creo que sí, pero no lo confirmo", ponderacion: 1 },
              { id: "o2", text: "Mis clientes generalmente lo expresan", ponderacion: 2 },
              { id: "o3", text: "Recibo retroalimentación continua", ponderacion: 3 },
              { id: "o4", text: "Es tan esencial que no pueden prescindir de ello", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 11: SERVICIO AL CLIENTE
  {
    id: "modulo11_servicio_cliente",
    titulo: "MÓDULO 11: SERVICIO AL CLIENTE",
    icon: "Smile",
    submodules: [
      {
        id: "sub11_1_atencion_postventa",
        titulo: "Submódulo 1: Atención y postventa",
        preguntas: [
          {
            id: "m11s1q1",
            pregunta: "¿Cómo das seguimiento a tus clientes luego de la venta?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Espero que no surjan problemas, respondo si me contactan", ponderacion: 1 },
              { id: "o2", text: "Intento responder en menos de 24 horas", ponderacion: 2 },
              { id: "o3", text: "Uso CRM o chatbots para la postventa", ponderacion: 3 },
              { id: "o4", text: "Manejo tiempos de respuesta y guiones establecidos", ponderacion: 4 },
            ],
          },
          {
            id: "m11s1q2",
            pregunta: "¿Tienes un protocolo para quejas o inconvenientes?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No, resuelvo cada caso como se presente", ponderacion: 1 },
              { id: "o2", text: "Atiendo de forma improvisada", ponderacion: 2 },
              { id: "o3", text: "Existe un responsable designado", ponderacion: 3 },
              { id: "o4", text: "Todo está documentado con seguimiento puntual", ponderacion: 4 },
            ],
          },
          {
            id: "m11s1q3",
            pregunta: "¿Mides la satisfacción del cliente de alguna forma?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Desconozco cómo hacerlo", ponderacion: 1 },
              { id: "o2", text: "A veces pregunto informalmente", ponderacion: 2 },
              { id: "o3", text: "Uso encuestas simples", ponderacion: 3 },
              { id: "o4", text: "Manejo NPS, CSAT u otros indicadores", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 12: OKRs Y KPIs POR ÁREA
  {
    id: "modulo12_okrs_kpis",
    titulo: "MÓDULO 12: OKRs Y KPIs POR ÁREA",
    icon: "BarChart2",
    submodules: [
      {
        id: "sub12_1_objetivos_area",
        titulo: "Submódulo 1: Objetivos por área",
        preguntas: [
          {
            id: "m12s1q1",
            pregunta: "¿Cuentas con metas claras en cada área de tu empresa?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No tengo definidas las áreas", ponderacion: 1 },
              { id: "o2", text: "Solo ventas maneja objetivos", ponderacion: 2 },
              { id: "o3", text: "Algunas áreas tienen objetivos, pero no todas", ponderacion: 3 },
              { id: "o4", text: "Todas las áreas manejan OKRs y seguimiento trimestral", ponderacion: 4 },
            ],
          },
          {
            id: "m12s1q2",
            pregunta: "¿Cada cuánto revisas el avance de esas metas?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Nunca", ponderacion: 1 },
              { id: "o2", text: "De forma esporádica", ponderacion: 2 },
              { id: "o3", text: "Mensualmente", ponderacion: 3 },
              { id: "o4", text: "Semanalmente con reuniones de equipo", ponderacion: 4 },
            ],
          },
          {
            id: "m12s1q3",
            pregunta: "¿Quién define los objetivos de cada área?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Yo decido todo", ponderacion: 1 },
              { id: "o2", text: "Los líderes de área", ponderacion: 2 },
              { id: "o3", text: "Se acuerdan en conjunto con el equipo", ponderacion: 3 },
              { id: "o4", text: "Existe un sistema formal de definición", ponderacion: 4 },
            ],
          },
        ],
      },
      {
        id: "sub12_2_kpis",
        titulo: "Submódulo 2: Indicadores clave (KPIs)",
        preguntas: [
          {
            id: "m12s2q1",
            pregunta: "¿Tienes indicadores específicos para medir el éxito en tu negocio?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Solo ventas", ponderacion: 1 },
              { id: "o2", text: "Uno que otro indicador informal", ponderacion: 2 },
              { id: "o3", text: "Existen KPIs, pero no se revisan constantemente", ponderacion: 3 },
              { id: "o4", text: "Contamos con reportes integrados y seguimiento periódico", ponderacion: 4 },
            ],
          },
          {
            id: "m12s2q2",
            pregunta: "¿Compartes estos KPIs con tu equipo de manera clara?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "No lo veo necesario", ponderacion: 1 },
              { id: "o2", text: "A veces, en reuniones concretas", ponderacion: 2 },
              { id: "o3", text: "Sí, pero no todos los entienden", ponderacion: 3 },
              { id: "o4", text: "Todo el equipo tiene acceso y claridad sobre ellos", ponderacion: 4 },
            ],
          },
          {
            id: "m12s2q3",
            pregunta: "¿Qué ocurre si un KPI está por debajo de la meta?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Me frustro y no actúo mucho", ponderacion: 1 },
              { id: "o2", text: "Intento solucionarlo en el momento", ponderacion: 2 },
              { id: "o3", text: "Analizamos en equipo para corregir", ponderacion: 3 },
              { id: "o4", text: "Hay protocolos y ajustes inmediatos", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
  // MÓDULO 13: PROPÓSITO FINAL Y EQUILIBRIO DEL FUNDADOR
  {
    id: "modulo13_proposito_equilibrio",
    titulo: "MÓDULO 13: PROPÓSITO FINAL Y EQUILIBRIO DEL FUNDADOR",
    icon: "Sunrise",
    submodules: [
      {
        id: "sub13_1_vida_negocio",
        titulo: "Submódulo 1: Alineación vida-negocio",
        preguntas: [
          {
            id: "m13s1q1",
            pregunta: "¿Tu empresa te brinda paz o te genera más tensión?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Estoy en un estado de agotamiento", ponderacion: 1 },
              { id: "o2", text: "Me estresa, pero también me motiva", ponderacion: 2 },
              { id: "o3", text: "Me da libertad, aunque ocasionalmente me satura", ponderacion: 3 },
              { id: "o4", text: "Siento paz y satisfacción, disfruto mi labor", ponderacion: 4 },
            ],
          },
          {
            id: "m13s1q2",
            pregunta: "¿Qué porcentaje de tu tiempo dedicas a tu vida personal fuera del trabajo?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "0%", ponderacion: 1 },
              { id: "o2", text: "Menos del 10%", ponderacion: 2 },
              { id: "o3", text: "Entre 10% y 30%", ponderacion: 3 },
              { id: "o4", text: "Más del 30%", ponderacion: 4 },
            ],
          },
          {
            id: "m13s1q3",
            pregunta: "¿Has pasado por momentos de burnout o ansiedad relacionados con el negocio?",
            ponderacionPregunta: 1,
            tipo: "single",
            opciones: [
              { id: "o1", text: "Frecuentemente", ponderacion: 1 },
              { id: "o2", text: "Más de una vez", ponderacion: 2 },
              { id: "o3", text: "Algunas veces, aunque las manejo", ponderacion: 3 },
              { id: "o4", text: "Casi nunca, tengo equilibrio", ponderacion: 4 },
            ],
          },
        ],
      },
    ],
  },
]
