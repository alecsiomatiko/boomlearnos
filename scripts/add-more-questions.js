const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env' });

// Preguntas adicionales por módulo
const additionalQuestions = {
  MOD2: [ // Procesos y Sistemas - necesita 7 más
    {
      text: "¿Cómo se documentan los procesos clave de tu organización?",
      options: [
        { text: "Documentación formal actualizada", weight: 10 },
        { text: "Documentación informal o desactualizada", weight: 6 },
        { text: "Procesos transmitidos verbalmente", weight: 3 },
        { text: "Sin documentación formal", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan automatizados están los procesos operativos?",
      options: [
        { text: "Mayoría de procesos automatizados", weight: 10 },
        { text: "Automatización parcial", weight: 7 },
        { text: "Automatización mínima", weight: 4 },
        { text: "Procesos completamente manuales", weight: 1 }
      ]
    },
    {
      text: "¿Con qué frecuencia se revisan y optimizan los procesos?",
      options: [
        { text: "Revisión trimestral sistemática", weight: 10 },
        { text: "Revisión semestral", weight: 7 },
        { text: "Revisión anual", weight: 4 },
        { text: "Solo cuando hay problemas", weight: 1 }
      ]
    },
    {
      text: "¿Cómo se miden los tiempos de ciclo de los procesos?",
      options: [
        { text: "Medición automatizada en tiempo real", weight: 10 },
        { text: "Medición manual periódica", weight: 6 },
        { text: "Estimaciones aproximadas", weight: 3 },
        { text: "No se miden", weight: 1 }
      ]
    },
    {
      text: "¿Existe un sistema de gestión de calidad implementado?",
      options: [
        { text: "Sistema certificado (ISO u otro)", weight: 10 },
        { text: "Sistema interno estructurado", weight: 7 },
        { text: "Controles básicos de calidad", weight: 4 },
        { text: "Sin sistema formal", weight: 1 }
      ]
    },
    {
      text: "¿Cómo se gestionan las excepciones en los procesos?",
      options: [
        { text: "Procedimientos documentados y automatizados", weight: 10 },
        { text: "Protocolos establecidos", weight: 7 },
        { text: "Se resuelven caso por caso", weight: 4 },
        { text: "Sin protocolos definidos", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan integrados están los sistemas tecnológicos?",
      options: [
        { text: "Integración completa y automatizada", weight: 10 },
        { text: "Integración parcial", weight: 6 },
        { text: "Sistemas independientes con conexiones manuales", weight: 3 },
        { text: "Sistemas completamente aislados", weight: 1 }
      ]
    }
  ],
  MOD3: [ // Ventas y Marketing - necesita 7 más
    {
      text: "¿Cómo defines y segmentas tu mercado objetivo?",
      options: [
        { text: "Segmentación detallada con personas buyer", weight: 10 },
        { text: "Segmentación básica por demografía", weight: 6 },
        { text: "Definición general del mercado", weight: 3 },
        { text: "Sin segmentación definida", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan efectivo es tu embudo de ventas?",
      options: [
        { text: "Embudo optimizado con alta conversión", weight: 10 },
        { text: "Embudo definido con conversión aceptable", weight: 7 },
        { text: "Embudo básico sin optimización", weight: 4 },
        { text: "Sin embudo estructurado", weight: 1 }
      ]
    },
    {
      text: "¿Cómo mides el ROI de tus campañas de marketing?",
      options: [
        { text: "Medición detallada por canal y campaña", weight: 10 },
        { text: "Medición general de resultados", weight: 6 },
        { text: "Métricas básicas de engagement", weight: 3 },
        { text: "No se mide el ROI", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan desarrollada está tu presencia digital?",
      options: [
        { text: "Estrategia omnicanal integrada", weight: 10 },
        { text: "Presencia activa en canales principales", weight: 7 },
        { text: "Presencia básica en redes sociales", weight: 4 },
        { text: "Presencia digital mínima o nula", weight: 1 }
      ]
    },
    {
      text: "¿Cómo gestionas la relación con los clientes?",
      options: [
        { text: "CRM avanzado con automatización", weight: 10 },
        { text: "CRM básico implementado", weight: 7 },
        { text: "Hojas de cálculo y correos", weight: 4 },
        { text: "Sin sistema estructurado", weight: 1 }
      ]
    },
    {
      text: "¿Con qué frecuencia lanzas campañas de marketing?",
      options: [
        { text: "Campañas continuas con calendario definido", weight: 10 },
        { text: "Campañas mensuales o trimestrales", weight: 7 },
        { text: "Campañas ocasionales", weight: 4 },
        { text: "Sin campañas estructuradas", weight: 1 }
      ]
    },
    {
      text: "¿Cómo analizas a tu competencia?",
      options: [
        { text: "Análisis competitivo estructurado y continuo", weight: 10 },
        { text: "Monitoreo periódico de competidores", weight: 6 },
        { text: "Observación informal ocasional", weight: 3 },
        { text: "Sin análisis competitivo", weight: 1 }
      ]
    }
  ],
  MOD4: [ // Finanzas y Métricas - necesita 7 más
    {
      text: "¿Con qué frecuencia revisas los estados financieros?",
      options: [
        { text: "Revisión diaria o semanal", weight: 10 },
        { text: "Revisión mensual", weight: 7 },
        { text: "Revisión trimestral", weight: 4 },
        { text: "Revisión anual o irregular", weight: 1 }
      ]
    },
    {
      text: "¿Tienes un sistema de presupuesto y control de gastos?",
      options: [
        { text: "Sistema automatizado con alertas", weight: 10 },
        { text: "Presupuesto formal con seguimiento", weight: 7 },
        { text: "Presupuesto básico sin control estricto", weight: 4 },
        { text: "Sin presupuesto formal", weight: 1 }
      ]
    },
    {
      text: "¿Cómo proyectas el flujo de caja?",
      options: [
        { text: "Proyecciones automáticas a 12 meses", weight: 10 },
        { text: "Proyecciones manuales trimestrales", weight: 6 },
        { text: "Estimaciones mensuales básicas", weight: 3 },
        { text: "Sin proyecciones formales", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan detallado es tu análisis de rentabilidad?",
      options: [
        { text: "Análisis por producto/servicio y cliente", weight: 10 },
        { text: "Análisis por línea de negocio", weight: 7 },
        { text: "Análisis general de la empresa", weight: 4 },
        { text: "Sin análisis de rentabilidad", weight: 1 }
      ]
    },
    {
      text: "¿Utilizas indicadores financieros clave (KPIs)?",
      options: [
        { text: "Dashboard con KPIs en tiempo real", weight: 10 },
        { text: "KPIs definidos con reporte mensual", weight: 7 },
        { text: "Algunos indicadores básicos", weight: 4 },
        { text: "Sin KPIs definidos", weight: 1 }
      ]
    },
    {
      text: "¿Cómo gestionas las cuentas por cobrar?",
      options: [
        { text: "Sistema automatizado con seguimiento", weight: 10 },
        { text: "Seguimiento manual estructurado", weight: 6 },
        { text: "Control básico de facturas", weight: 3 },
        { text: "Sin sistema de gestión", weight: 1 }
      ]
    },
    {
      text: "¿Tienes un plan de inversión y crecimiento?",
      options: [
        { text: "Plan estratégico financiero a 3-5 años", weight: 10 },
        { text: "Plan anual de inversiones", weight: 7 },
        { text: "Decisiones de inversión ad-hoc", weight: 4 },
        { text: "Sin plan de inversión", weight: 1 }
      ]
    }
  ],
  MOD8: [ // Recursos Humanos - necesita 7 más
    {
      text: "¿Cómo realizas el proceso de reclutamiento?",
      options: [
        { text: "Proceso estructurado con múltiples filtros", weight: 10 },
        { text: "Proceso definido con entrevistas", weight: 7 },
        { text: "Proceso informal", weight: 4 },
        { text: "Contratación por referencias únicamente", weight: 1 }
      ]
    },
    {
      text: "¿Existe un programa de capacitación continua?",
      options: [
        { text: "Programa anual con presupuesto asignado", weight: 10 },
        { text: "Capacitaciones ocasionales", weight: 6 },
        { text: "Capacitación solo cuando es necesario", weight: 3 },
        { text: "Sin programa de capacitación", weight: 1 }
      ]
    },
    {
      text: "¿Cómo evalúas el desempeño del personal?",
      options: [
        { text: "Evaluaciones formales trimestrales con feedback", weight: 10 },
        { text: "Evaluaciones anuales estructuradas", weight: 7 },
        { text: "Evaluaciones informales", weight: 4 },
        { text: "Sin evaluaciones de desempeño", weight: 1 }
      ]
    },
    {
      text: "¿Tienes un plan de desarrollo de carrera para empleados?",
      options: [
        { text: "Planes individuales con objetivos claros", weight: 10 },
        { text: "Oportunidades de crecimiento definidas", weight: 7 },
        { text: "Crecimiento orgánico sin plan", weight: 4 },
        { text: "Sin plan de carrera", weight: 1 }
      ]
    },
    {
      text: "¿Cómo mides el clima laboral?",
      options: [
        { text: "Encuestas periódicas con plan de acción", weight: 10 },
        { text: "Encuestas anuales", weight: 6 },
        { text: "Feedback informal", weight: 3 },
        { text: "No se mide", weight: 1 }
      ]
    },
    {
      text: "¿Existe un sistema de compensación y beneficios estructurado?",
      options: [
        { text: "Sistema competitivo con benchmarking", weight: 10 },
        { text: "Paquete de beneficios definido", weight: 7 },
        { text: "Compensación básica sin beneficios", weight: 4 },
        { text: "Sin estructura definida", weight: 1 }
      ]
    },
    {
      text: "¿Cómo gestionas la rotación de personal?",
      options: [
        { text: "Análisis de causas con plan de retención", weight: 10 },
        { text: "Seguimiento de indicadores de rotación", weight: 6 },
        { text: "Se registra pero no se analiza", weight: 3 },
        { text: "Sin gestión de rotación", weight: 1 }
      ]
    }
  ],
  MOD9: [ // Tecnología y Sistemas - necesita 7 más
    {
      text: "¿Cómo gestionas la seguridad de la información?",
      options: [
        { text: "Políticas de seguridad implementadas y auditadas", weight: 10 },
        { text: "Medidas básicas de seguridad", weight: 6 },
        { text: "Seguridad mínima", weight: 3 },
        { text: "Sin políticas de seguridad", weight: 1 }
      ]
    },
    {
      text: "¿Realizas respaldos de información crítica?",
      options: [
        { text: "Respaldos automáticos diarios en la nube", weight: 10 },
        { text: "Respaldos semanales", weight: 7 },
        { text: "Respaldos ocasionales", weight: 4 },
        { text: "Sin respaldos sistemáticos", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan actualizada está tu infraestructura tecnológica?",
      options: [
        { text: "Tecnología de última generación", weight: 10 },
        { text: "Tecnología actual (últimos 3 años)", weight: 7 },
        { text: "Tecnología funcional pero desactualizada", weight: 4 },
        { text: "Tecnología obsoleta", weight: 1 }
      ]
    },
    {
      text: "¿Tienes un plan de continuidad de negocio (BCP)?",
      options: [
        { text: "Plan documentado y probado regularmente", weight: 10 },
        { text: "Plan básico documentado", weight: 6 },
        { text: "Ideas informales sin documentar", weight: 3 },
        { text: "Sin plan de continuidad", weight: 1 }
      ]
    },
    {
      text: "¿Cómo gestionas las actualizaciones de software?",
      options: [
        { text: "Actualizaciones programadas y controladas", weight: 10 },
        { text: "Actualizaciones periódicas", weight: 7 },
        { text: "Actualizaciones cuando hay problemas", weight: 4 },
        { text: "Sin gestión de actualizaciones", weight: 1 }
      ]
    },
    {
      text: "¿Utilizas herramientas de análisis de datos?",
      options: [
        { text: "BI avanzado con dashboards en tiempo real", weight: 10 },
        { text: "Herramientas básicas de análisis", weight: 6 },
        { text: "Excel y reportes manuales", weight: 3 },
        { text: "Sin herramientas de análisis", weight: 1 }
      ]
    },
    {
      text: "¿Cómo capacitas al personal en nuevas tecnologías?",
      options: [
        { text: "Programa de capacitación continua", weight: 10 },
        { text: "Capacitación cuando se implementa algo nuevo", weight: 6 },
        { text: "Aprendizaje por cuenta propia", weight: 3 },
        { text: "Sin capacitación tecnológica", weight: 1 }
      ]
    }
  ],
  MOD10: [ // Estrategia Competitiva - necesita 7 más
    {
      text: "¿Tienes identificadas tus ventajas competitivas?",
      options: [
        { text: "Ventajas claramente definidas y comunicadas", weight: 10 },
        { text: "Algunas ventajas identificadas", weight: 6 },
        { text: "Ideas generales sin formalizar", weight: 3 },
        { text: "Sin ventajas competitivas claras", weight: 1 }
      ]
    },
    {
      text: "¿Cómo defines tu posicionamiento en el mercado?",
      options: [
        { text: "Posicionamiento estratégico diferenciado", weight: 10 },
        { text: "Posicionamiento definido", weight: 7 },
        { text: "Posicionamiento genérico", weight: 4 },
        { text: "Sin posicionamiento claro", weight: 1 }
      ]
    },
    {
      text: "¿Realizas análisis FODA regularmente?",
      options: [
        { text: "Análisis trimestral con plan de acción", weight: 10 },
        { text: "Análisis anual", weight: 6 },
        { text: "Análisis ocasional", weight: 3 },
        { text: "Sin análisis FODA", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan clara es tu propuesta de valor?",
      options: [
        { text: "Propuesta única y claramente comunicada", weight: 10 },
        { text: "Propuesta definida", weight: 7 },
        { text: "Propuesta genérica", weight: 4 },
        { text: "Sin propuesta de valor clara", weight: 1 }
      ]
    },
    {
      text: "¿Cómo monitoreas las tendencias del mercado?",
      options: [
        { text: "Sistema de inteligencia de mercado", weight: 10 },
        { text: "Monitoreo regular de publicaciones", weight: 6 },
        { text: "Observación ocasional", weight: 3 },
        { text: "Sin monitoreo sistemático", weight: 1 }
      ]
    },
    {
      text: "¿Tienes estrategias de alianzas y colaboraciones?",
      options: [
        { text: "Red de alianzas estratégicas activas", weight: 10 },
        { text: "Algunas alianzas puntuales", weight: 6 },
        { text: "Relaciones comerciales básicas", weight: 3 },
        { text: "Sin alianzas estratégicas", weight: 1 }
      ]
    },
    {
      text: "¿Cómo respondes a las acciones de la competencia?",
      options: [
        { text: "Estrategia proactiva con planes de contingencia", weight: 10 },
        { text: "Respuesta planificada", weight: 7 },
        { text: "Respuesta reactiva", weight: 4 },
        { text: "Sin estrategia de respuesta", weight: 1 }
      ]
    }
  ],
  MOD11: [ // Sostenibilidad y RSE - necesita 7 más
    {
      text: "¿Tienes una política ambiental definida?",
      options: [
        { text: "Política documentada con objetivos y métricas", weight: 10 },
        { text: "Lineamientos generales de sostenibilidad", weight: 6 },
        { text: "Iniciativas ambientales aisladas", weight: 3 },
        { text: "Sin política ambiental", weight: 1 }
      ]
    },
    {
      text: "¿Cómo gestionas los residuos y reciclaje?",
      options: [
        { text: "Programa integral de gestión de residuos", weight: 10 },
        { text: "Separación básica y reciclaje", weight: 7 },
        { text: "Disposición convencional", weight: 4 },
        { text: "Sin gestión de residuos", weight: 1 }
      ]
    },
    {
      text: "¿Realizas programas de responsabilidad social?",
      options: [
        { text: "Programas estructurados con presupuesto", weight: 10 },
        { text: "Iniciativas ocasionales", weight: 6 },
        { text: "Donaciones esporádicas", weight: 3 },
        { text: "Sin programas de RSE", weight: 1 }
      ]
    },
    {
      text: "¿Mides tu huella de carbono?",
      options: [
        { text: "Medición anual con plan de reducción", weight: 10 },
        { text: "Estimaciones básicas", weight: 6 },
        { text: "Conocimiento general sin métricas", weight: 3 },
        { text: "No se mide", weight: 1 }
      ]
    },
    {
      text: "¿Cómo promueves prácticas éticas en tu cadena de valor?",
      options: [
        { text: "Código de ética con auditorías a proveedores", weight: 10 },
        { text: "Lineamientos éticos definidos", weight: 7 },
        { text: "Expectativas generales", weight: 4 },
        { text: "Sin promoción de prácticas éticas", weight: 1 }
      ]
    },
    {
      text: "¿Tienes certificaciones de sostenibilidad?",
      options: [
        { text: "Certificaciones internacionales vigentes", weight: 10 },
        { text: "En proceso de certificación", weight: 6 },
        { text: "Interés sin acciones concretas", weight: 3 },
        { text: "Sin certificaciones", weight: 1 }
      ]
    },
    {
      text: "¿Comunicas tus iniciativas de sostenibilidad?",
      options: [
        { text: "Reportes de sostenibilidad publicados", weight: 10 },
        { text: "Comunicación en redes y sitio web", weight: 7 },
        { text: "Comunicación interna únicamente", weight: 4 },
        { text: "Sin comunicación de iniciativas", weight: 1 }
      ]
    }
  ],
  MOD13: [ // Evaluación Integral - necesita 7 más
    {
      text: "¿Realizas evaluaciones integrales de tu organización?",
      options: [
        { text: "Evaluación 360° trimestral", weight: 10 },
        { text: "Evaluación anual estructurada", weight: 7 },
        { text: "Evaluaciones informales", weight: 4 },
        { text: "Sin evaluaciones integrales", weight: 1 }
      ]
    },
    {
      text: "¿Cómo mides el cumplimiento de objetivos estratégicos?",
      options: [
        { text: "Sistema de OKRs o BSC implementado", weight: 10 },
        { text: "Seguimiento mensual de objetivos", weight: 7 },
        { text: "Revisión trimestral básica", weight: 4 },
        { text: "Sin medición sistemática", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan alineadas están las diferentes áreas?",
      options: [
        { text: "Alineación total con reuniones interdepartamentales", weight: 10 },
        { text: "Buena comunicación entre áreas", weight: 7 },
        { text: "Comunicación básica necesaria", weight: 4 },
        { text: "Áreas trabajan en silos", weight: 1 }
      ]
    },
    {
      text: "¿Utilizas metodologías ágiles en tu organización?",
      options: [
        { text: "Metodologías ágiles implementadas en toda la org", weight: 10 },
        { text: "Agile en algunas áreas", weight: 7 },
        { text: "Conocimiento básico sin implementación", weight: 4 },
        { text: "Metodologías tradicionales únicamente", weight: 1 }
      ]
    },
    {
      text: "¿Cómo gestionas los proyectos de mejora continua?",
      options: [
        { text: "Programa Kaizen o similar implementado", weight: 10 },
        { text: "Proyectos de mejora planificados", weight: 7 },
        { text: "Mejoras ocasionales", weight: 4 },
        { text: "Sin gestión de mejora continua", weight: 1 }
      ]
    },
    {
      text: "¿Qué tan preparada está tu organización para cambios disruptivos?",
      options: [
        { text: "Alta capacidad de adaptación y planes de contingencia", weight: 10 },
        { text: "Capacidad de adaptación aceptable", weight: 7 },
        { text: "Adaptación lenta y reactiva", weight: 4 },
        { text: "Baja capacidad de adaptación", weight: 1 }
      ]
    },
    {
      text: "¿Realizas benchmarking con otras organizaciones?",
      options: [
        { text: "Benchmarking sistemático con mejores prácticas", weight: 10 },
        { text: "Comparaciones ocasionales", weight: 6 },
        { text: "Conocimiento informal del sector", weight: 3 },
        { text: "Sin benchmarking", weight: 1 }
      ]
    }
  ]
};

async function insertAdditionalQuestions() {
  let connection;
  
  try {
    console.log('🚀 Iniciando inserción de preguntas adicionales...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión establecida\n');

    for (const [moduleCode, questions] of Object.entries(additionalQuestions)) {
      console.log(`\n📦 Procesando ${moduleCode}...`);
      
      // Obtener el módulo
      const [modules] = await connection.execute(
        'SELECT id FROM diagnostic_modules WHERE module_code = ?',
        [moduleCode]
      );
      
      if (modules.length === 0) {
        console.log(`❌ Módulo ${moduleCode} no encontrado`);
        continue;
      }
      
      const moduleId = modules[0].id;
      
      // Obtener el primer submódulo del módulo
      const [submodules] = await connection.execute(
        'SELECT id FROM diagnostic_submodules WHERE module_id = ? ORDER BY order_index LIMIT 1',
        [moduleId]
      );
      
      if (submodules.length === 0) {
        console.log(`❌ Sin submódulos para ${moduleCode}`);
        continue;
      }
      
      const submoduleId = submodules[0].id;
      
      // Obtener el máximo order_index actual
      const [maxOrder] = await connection.execute(
        'SELECT COALESCE(MAX(order_index), 0) as max_order FROM diagnostic_questions WHERE submodule_id = ?',
        [submoduleId]
      );
      
      let currentOrder = maxOrder[0].max_order;
      
      // Insertar preguntas
      for (const question of questions) {
        currentOrder++;
        const questionId = uuidv4();
        const questionCode = `${moduleCode}_Q${currentOrder}`;
        
        await connection.execute(`
          INSERT INTO diagnostic_questions (
            id, question_code, submodule_id, question_text, question_type,
            weight, order_index, is_optional, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          questionId,
          questionCode,
          submoduleId,
          question.text,
          'single',
          5,
          currentOrder,
          0
        ]);
        
        // Insertar opciones
        for (let i = 0; i < question.options.length; i++) {
          const option = question.options[i];
          const optionId = uuidv4();
          const optionCode = `${questionCode}_OPT${i + 1}`;
          
          await connection.execute(`
            INSERT INTO diagnostic_options (
              id, option_code, question_id, option_text, weight,
              order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, [
            optionId,
            optionCode,
            questionId,
            option.text,
            option.weight,
            i + 1
          ]);
        }
        
        console.log(`  ✅ ${questionCode}: ${question.text.substring(0, 50)}...`);
      }
      
      console.log(`✨ ${moduleCode}: ${questions.length} preguntas agregadas`);
    }
    
    console.log('\n\n🎉 ¡Proceso completado exitosamente!');
    console.log('📊 Resumen:');
    
    for (const [moduleCode, questions] of Object.entries(additionalQuestions)) {
      console.log(`   • ${moduleCode}: +${questions.length} preguntas`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

insertAdditionalQuestions();
