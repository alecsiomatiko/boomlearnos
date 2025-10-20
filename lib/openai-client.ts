import OpenAI from 'openai'

// 🔧 Cliente OpenAI singleton con lazy loading
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('❌ OPENAI_API_KEY no está configurada en las variables de entorno')
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
    })
  }
  return openaiClient
}

// 🔧 Verificar si OpenAI está disponible (para builds sin API key)
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}