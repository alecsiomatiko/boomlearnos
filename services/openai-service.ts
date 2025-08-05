import OpenAI from "openai"

// Singleton para el cliente de OpenAI
let openaiClient: OpenAI | null = null

export function getOpenAIClient(apiKey?: string): OpenAI | null {
  // Si ya tenemos un cliente y no se proporciona una nueva API key, devolver el cliente existente
  if (openaiClient && !apiKey) return openaiClient

  // Si no hay API key, intentar obtenerla del localStorage
  if (!apiKey && typeof window !== "undefined") {
    apiKey = localStorage.getItem("openai_api_key") || undefined
  }

  // Si no hay API key, devolver null
  if (!apiKey) return null

  // Crear un nuevo cliente con la API key proporcionada
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Permitir en el navegador para desarrollo
  })

  return openaiClient
}

// Función para validar una API key
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })

    // Hacer una llamada simple para verificar que la API key es válida
    await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test" }],
      max_tokens: 5,
    })

    return true
  } catch (error) {
    console.error("Error validating OpenAI API key:", error)
    return false
  }
}

// Función para generar texto con OpenAI
export async function generateText(
  prompt: string,
  systemPrompt = "Eres un asistente útil.",
  options: {
    temperature?: number
    maxTokens?: number
    apiKey?: string
  } = {},
): Promise<string> {
  const { temperature = 0.7, maxTokens = 500, apiKey } = options

  // Obtener el cliente de OpenAI
  const client = getOpenAIClient(apiKey)
  if (!client) {
    throw new Error("No se pudo obtener el cliente de OpenAI. Verifica tu API key.")
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    })

    return response.choices[0]?.message?.content || "No se pudo generar una respuesta."
  } catch (error) {
    console.error("Error generating text with OpenAI:", error)
    throw new Error("Error al generar texto con OpenAI. Inténtalo de nuevo más tarde.")
  }
}

// Función para analizar respuestas del cuestionario
export async function analyzeQuestionnaireResponses(
  answers: Record<string, string>,
  apiKey?: string,
): Promise<{
  categoryScores: Record<string, number>
  painPoints: Array<{ id: string; name: string; score: number }>
  overallHealth: number
  recommendations: string[]
  businessProfile: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
  }
}> {
  const prompt = `
Analiza las siguientes respuestas de un cuestionario de diagnóstico empresarial:

${Object.entries(answers)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n\n")}

Genera un análisis con los siguientes elementos:
1. Puntuaciones por categoría (del 0 al 100) para: estructura, finanzas, marketing, equipo, operaciones
2. Identifica los 3 principales puntos de dolor (categorías con menor puntuación)
3. Calcula una puntuación de salud general (promedio de todas las categorías)
4. Proporciona 3-5 recomendaciones específicas basadas en las respuestas
5. Crea un perfil empresarial con fortalezas, debilidades y oportunidades

Responde en formato JSON con la siguiente estructura:
{
  "categoryScores": {
    "estructura": number,
    "finanzas": number,
    "marketing": number,
    "equipo": number,
    "operaciones": number
  },
  "painPoints": [
    {"id": "categoria_id", "name": "Nombre Categoría", "score": number},
    ...
  ],
  "overallHealth": number,
  "recommendations": ["recomendación 1", ...],
  "businessProfile": {
    "strengths": ["fortaleza 1", ...],
    "weaknesses": ["debilidad 1", ...],
    "opportunities": ["oportunidad 1", ...]
  }
}
`

  const systemPrompt = `
Eres un consultor empresarial experto que analiza respuestas de cuestionarios para proporcionar diagnósticos precisos.
Debes responder ÚNICAMENTE con un objeto JSON válido según la estructura solicitada.
No incluyas explicaciones adicionales, solo el JSON.
`

  try {
    const jsonResponse = await generateText(prompt, systemPrompt, {
      temperature: 0.5,
      maxTokens: 1000,
      apiKey,
    })

    // Parsear la respuesta JSON
    return JSON.parse(jsonResponse)
  } catch (error) {
    console.error("Error analyzing questionnaire responses:", error)

    // Devolver un análisis predeterminado en caso de error
    return {
      categoryScores: {
        estructura: 50,
        finanzas: 45,
        marketing: 60,
        equipo: 55,
        operaciones: 50,
      },
      painPoints: [
        { id: "finanzas", name: "Finanzas", score: 45 },
        { id: "estructura", name: "Estructura Organizacional", score: 50 },
        { id: "operaciones", name: "Operaciones", score: 50 },
      ],
      overallHealth: 52,
      recommendations: [
        "Establece un sistema básico de control financiero",
        "Documenta tus procesos principales",
        "Desarrolla un plan de marketing enfocado en tu cliente ideal",
      ],
      businessProfile: {
        strengths: ["Conocimiento del mercado", "Propuesta de valor única"],
        weaknesses: ["Estructura organizacional", "Control financiero"],
        opportunities: ["Expansión de mercado", "Optimización de procesos"],
      },
    }
  }
}

// Función para sugerir respuestas a preguntas abiertas
export async function suggestAnswerForQuestion(
  questionId: string,
  questionText: string,
  businessContext: Record<string, string>,
  apiKey?: string,
): Promise<string> {
  const prompt = `
Necesito ayuda para responder a la siguiente pregunta de un cuestionario empresarial:

Pregunta: "${questionText}"

Contexto sobre mi negocio:
${Object.entries(businessContext)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Por favor, sugiere una respuesta detallada y específica para esta pregunta.
`

  const systemPrompt = `
Eres un consultor empresarial experto que ayuda a emprendedores a responder preguntas de diagnóstico.
Proporciona respuestas detalladas, específicas y personalizadas basadas en el contexto proporcionado.
La respuesta debe ser concisa (máximo 3-4 oraciones) pero completa.
`

  try {
    return await generateText(prompt, systemPrompt, {
      temperature: 0.7,
      maxTokens: 200,
      apiKey,
    })
  } catch (error) {
    console.error("Error suggesting answer for question:", error)
    return "No se pudo generar una sugerencia. Por favor, intenta responder con tus propias palabras."
  }
}

// Función para analizar datos financieros
export async function analyzeFinancialData(
  financialData: any,
  apiKey?: string,
): Promise<{ insights: string[]; score: number }> {
  const prompt = `
Analiza los siguientes datos financieros de una empresa de los últimos 3 meses:

${JSON.stringify(financialData, null, 2)}

Actúa como un asesor financiero experto. Tu tarea es:
1. Calcular un "Puntaje de Salud Financiera" general del 0 al 100. Considera la rentabilidad (margen de beneficio), la consistencia de los ingresos y el control de gastos. Un puntaje por encima de 75 es bueno, por debajo de 50 es preocupante.
2. Generar 3 insights o recomendaciones clave, cortas y accionables, basadas en los datos. Enfócate en tendencias, áreas de mejora o puntos fuertes.

Responde en formato JSON con la siguiente estructura:
{
  "score": number,
  "insights": ["insight 1", "insight 2", "insight 3"]
}
No incluyas explicaciones adicionales, solo el JSON.
`

  const systemPrompt = `
Eres un consultor financiero experto que analiza datos para proporcionar diagnósticos precisos.
Debes responder ÚNICAMENTE con un objeto JSON válido según la estructura solicitada.
`

  try {
    const jsonResponse = await generateText(prompt, systemPrompt, {
      temperature: 0.4,
      maxTokens: 600,
      apiKey,
    })

    return JSON.parse(jsonResponse)
  } catch (error) {
    console.error("Error analyzing financial data:", error)
    // Fallback response in case of API error
    return {
      score: 68,
      insights: [
        "Tus ingresos muestran una tendencia positiva, ¡buen trabajo!",
        "Considera revisar los gastos de 'Nómina', que han aumentado recientemente.",
        "El margen de beneficio es saludable, pero busca formas de optimizar costos para mejorarlo aún más.",
      ],
    }
  }
}
