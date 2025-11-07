import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '151.106.99.1',
  user: 'u191251575_BoomlearnOS',
  password: 'Cerounocero.com20182417',
  database: 'u191251575_BoomlearnOS',
  port: 3306
};

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

interface ModuleAnalysisRequest {
  userId: string;
  moduleCode: string;
}

/**
 * POST /api/diagnostic/module-ai-analysis
 * Genera análisis IA específico para un módulo completado
 */
export async function POST(request: NextRequest) {
  console.log('🤖 [MODULE-AI] Iniciando análisis IA de módulo');
  
  try {
    const body: ModuleAnalysisRequest = await request.json();
    const { userId, moduleCode } = body;

    if (!userId || !moduleCode) {
      return NextResponse.json(
        { error: 'userId y moduleCode son requeridos' },
        { status: 400 }
      );
    }

    console.log(`🔍 [MODULE-AI] Usuario: ${userId}, Módulo: ${moduleCode}`);

    const connection = await mysql.createConnection(dbConfig);

    try {
      // 1. Obtener información del módulo
      const [moduleInfo] = await connection.execute(`
        SELECT id, module_code, title, description
        FROM diagnostic_modules
        WHERE module_code = ?
      `, [moduleCode]);

      if ((moduleInfo as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Módulo no encontrado' },
          { status: 404 }
        );
      }

      const module = (moduleInfo as any[])[0];

      // 2. Obtener todas las respuestas del usuario para este módulo
      const [responses] = await connection.execute(`
        SELECT 
          dq.question_code,
          dq.question_text,
          dq.question_type,
          dop.option_code,
          dop.option_text,
          dop.weight,
          ds.submodule_code,
          ds.title as submodule_title,
          ur.created_at as answered_at
        FROM user_responses ur
        JOIN diagnostic_questions dq ON ur.question_id = dq.id
        JOIN diagnostic_options dop ON ur.selected_option_id = dop.id
        JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
        WHERE ur.user_id = ? AND ur.module_code = ?
        ORDER BY ds.order_index, dq.order_index
      `, [userId, moduleCode]);

      if ((responses as any[]).length === 0) {
        return NextResponse.json(
          { error: 'No hay respuestas para este módulo' },
          { status: 404 }
        );
      }

      console.log(`📊 [MODULE-AI] ${(responses as any[]).length} respuestas encontradas`);

      // 3. Obtener información del usuario
      const [userInfo] = await connection.execute(`
        SELECT id, name, email, business_type, city
        FROM users
        WHERE id = ?
      `, [userId]);

      const user = (userInfo as any[])[0];

      // 4. Obtener onboarding para contexto adicional
      let onboardingData = null;
      try {
        const [onboarding] = await connection.execute(`
          SELECT diagnostic_answers
          FROM onboarding_diagnostics
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `, [userId]);

        if ((onboarding as any[]).length > 0) {
          onboardingData = JSON.parse((onboarding as any[])[0].diagnostic_answers || '{}');
        }
      } catch (e) {
        console.log('⚠️ [MODULE-AI] No se pudo obtener onboarding');
      }

      // 5. Preparar datos para el análisis IA
      const responsesFormatted = (responses as any[]).map((r: any) => ({
        pregunta: r.question_text,
        respuesta: r.option_text,
        peso: r.weight,
        submódulo: r.submodule_title
      }));

      // 6. Generar análisis con OpenAI
      console.log('🤖 [MODULE-AI] Enviando a OpenAI...');
      
      const prompt = generatePromptForModule(module, responsesFormatted, user, onboardingData);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un consultor empresarial experto especializado en análisis de diagnósticos organizacionales. Tu trabajo es analizar las respuestas del usuario y proporcionar insights accionables, fortalezas identificadas, áreas de mejora y recomendaciones específicas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = completion.choices[0].message.content;
      console.log('✅ [MODULE-AI] Análisis generado por OpenAI');

      // 7. Parsear respuesta de IA (esperamos JSON estructurado)
      let analysis;
      try {
        analysis = JSON.parse(aiResponse || '{}');
      } catch (e) {
        // Si no es JSON válido, crear estructura manual
        analysis = {
          resumen: aiResponse,
          fortalezas: [],
          areas_mejora: [],
          recomendaciones: [],
          score_general: calculateAverageScore(responses as any[])
        };
      }

      // 8. Guardar análisis en base de datos (nueva tabla unificada)
      try {
        const { randomUUID } = require('crypto')
        const analysisId = randomUUID()
        
        await connection.execute(`
          INSERT INTO ai_analysis (
            id, user_id, analysis_type, module_id, module_code, analysis_data
          ) VALUES (?, ?, 'module', ?, ?, ?)
        `, [analysisId, userId, module.id, moduleCode, JSON.stringify(analysis)]);
        
        console.log('💾 [MODULE-AI] Análisis guardado en base de datos');
      } catch (saveError) {
        console.warn('⚠️ [MODULE-AI] Error al guardar análisis:', saveError);
        // Si falla, intentar con tabla legacy
        try {
          await connection.execute(`
            INSERT INTO ai_analysis_cache (
              user_id, module_code, analysis_data, created_at
            ) VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
              analysis_data = VALUES(analysis_data),
              created_at = NOW()
          `, [userId, moduleCode, JSON.stringify(analysis)]);
          console.log('💾 [MODULE-AI] Análisis guardado en caché legacy');
        } catch (legacyError) {
          console.warn('⚠️ [MODULE-AI] No se pudo guardar en ninguna tabla:', legacyError);
        }
      }

      // 9. Calcular métricas adicionales
      const metrics = calculateModuleMetrics(responses as any[]);

      return NextResponse.json({
        success: true,
        module: {
          code: module.module_code,
          title: module.title,
          description: module.description
        },
        analysis: {
          ...analysis,
          metrics,
          total_respuestas: (responses as any[]).length,
          fecha_analisis: new Date().toISOString()
        },
        usage: {
          tokens: completion.usage?.total_tokens || 0,
          model: completion.model
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error: any) {
    console.error('❌ [MODULE-AI] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error generando análisis IA',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * GET /api/diagnostic/module-ai-analysis?userId=XXX&moduleCode=YYY
 * Obtiene análisis IA desde caché o genera uno nuevo
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const moduleCode = searchParams.get('moduleCode');

  if (!userId || !moduleCode) {
    return NextResponse.json(
      { error: 'userId y moduleCode son requeridos' },
      { status: 400 }
    );
  }

  const connection = await mysql.createConnection(dbConfig);

  try {
    // ✅ Buscar en tabla unificada primero
    const [savedAnalysis] = await connection.execute(`
      SELECT analysis_data, created_at
      FROM ai_analysis
      WHERE user_id = ? AND module_code = ? AND analysis_type = 'module'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId, moduleCode]);

    if ((savedAnalysis as any[]).length > 0) {
      console.log('✅ [MODULE-AI] Análisis encontrado en base de datos');
      const analysis = JSON.parse((savedAnalysis as any[])[0].analysis_data);
      
      return NextResponse.json({
        success: true,
        cached: true,
        analysis,
        generatedAt: (savedAnalysis as any[])[0].created_at
      });
    }

    // Fallback: Buscar en caché legacy si no existe en nueva tabla
    const [cached] = await connection.execute(`
      SELECT analysis_data, created_at
      FROM ai_analysis_cache
      WHERE user_id = ? AND module_code = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId, moduleCode]);

    if ((cached as any[]).length > 0) {
      console.log('💾 [MODULE-AI] Análisis encontrado en caché legacy');
      const cachedAnalysis = JSON.parse((cached as any[])[0].analysis_data);
      
      return NextResponse.json({
        success: true,
        analysis: cachedAnalysis,
        cached: true,
        cached_at: (cached as any[])[0].created_at
      });
    }

    // Si no hay caché, generar nuevo análisis
    console.log('🔄 [MODULE-AI] No hay caché, generando nuevo análisis');
    await connection.end();
    
    // Llamar al endpoint POST para generar análisis
    return POST(request);

  } catch (error: any) {
    await connection.end();
    console.error('❌ [MODULE-AI] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function generatePromptForModule(
  module: any,
  responses: any[],
  user: any,
  onboardingData: any
): string {
  let contextInfo = `Usuario: ${user.name}\n`;
  if (user.business_type) contextInfo += `Tipo de negocio: ${user.business_type}\n`;
  if (onboardingData?.industry) contextInfo += `Industria: ${onboardingData.industry}\n`;
  if (onboardingData?.company_size) contextInfo += `Tamaño: ${onboardingData.company_size}\n`;

  const responsesText = responses.map((r, i) => 
    `${i + 1}. ${r.pregunta}\n   Respuesta: ${r.respuesta} (Peso: ${r.peso})\n   Submódulo: ${r.submódulo}`
  ).join('\n\n');

  return `
Analiza las siguientes respuestas del módulo "${module.title}" para el usuario "${user.name}".

CONTEXTO DEL USUARIO:
${contextInfo}

DESCRIPCIÓN DEL MÓDULO:
${module.description}

RESPUESTAS DEL USUARIO:
${responsesText}

Por favor proporciona un análisis estructurado en formato JSON con la siguiente estructura:

{
  "resumen": "Un resumen ejecutivo del estado del módulo (2-3 frases)",
  "score_general": <número del 1-10 basado en las respuestas>,
  "fortalezas": [
    "Fortaleza identificada 1",
    "Fortaleza identificada 2",
    "Fortaleza identificada 3"
  ],
  "areas_mejora": [
    {
      "area": "Nombre del área",
      "descripcion": "Por qué necesita mejora",
      "prioridad": "alta|media|baja"
    }
  ],
  "recomendaciones": [
    {
      "titulo": "Título de la recomendación",
      "descripcion": "Descripción detallada",
      "pasos": ["Paso 1", "Paso 2", "Paso 3"],
      "impacto_esperado": "Descripción del impacto"
    }
  ],
  "proximos_pasos": [
    "Acción concreta 1",
    "Acción concreta 2",
    "Acción concreta 3"
  ]
}

Asegúrate de que el análisis sea específico, accionable y relevante para el contexto empresarial del usuario.
`;
}

function calculateAverageScore(responses: any[]): number {
  if (responses.length === 0) return 0;
  const totalWeight = responses.reduce((sum, r) => sum + (r.weight || 0), 0);
  return Math.round((totalWeight / responses.length) * 10) / 10;
}

function calculateModuleMetrics(responses: any[]): any {
  const avgScore = calculateAverageScore(responses);
  const totalQuestions = responses.length;
  
  // Contar por peso
  const highScores = responses.filter(r => r.weight >= 4).length;
  const mediumScores = responses.filter(r => r.weight === 3).length;
  const lowScores = responses.filter(r => r.weight <= 2).length;

  return {
    score_promedio: avgScore,
    total_preguntas: totalQuestions,
    distribucion: {
      alto: highScores,
      medio: mediumScores,
      bajo: lowScores
    },
    nivel: avgScore >= 3.5 ? 'Bueno' : avgScore >= 2.5 ? 'Medio' : 'Necesita Atención'
  };
}
