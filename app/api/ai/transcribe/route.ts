import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI no configurado'
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    })

    // Obtener el archivo de audio del FormData
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({
        success: false,
        error: 'Archivo de audio requerido'
      }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json({
        success: false,
        error: 'El archivo debe ser de audio'
      }, { status: 400 })
    }

    // Convertir File a formato que acepta OpenAI
    const buffer = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(buffer)
    
    // Crear un objeto File-like que OpenAI pueda procesar
    const file = new File([audioBuffer], 'audio.wav', {
      type: audioFile.type
    })

    console.log('🎤 [WHISPER] Transcribiendo audio:', {
      size: audioFile.size,
      type: audioFile.type,
      name: audioFile.name
    })

    // Usar OpenAI Whisper para transcribir
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'es', // Español
      response_format: 'text',
      temperature: 0.2, // Más conservador para mejor precisión
    })

    console.log('✅ [WHISPER] Transcripción exitosa:', transcription.length, 'caracteres')

    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      audioSize: audioFile.size,
      processingTime: Date.now()
    })

  } catch (error: any) {
    console.error('❌ [WHISPER] Error:', error)
    
    // Manejar errores específicos de OpenAI
    if (error.code === 'invalid_request_error') {
      return NextResponse.json({
        success: false,
        error: 'Formato de audio no soportado. Intenta grabar de nuevo.'
      }, { status: 400 })
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json({
        success: false,
        error: 'Límite de transcripciones excedido. Intenta en un momento.'
      }, { status: 429 })
    }

    return NextResponse.json({
      success: false,
      error: 'Error procesando audio'
    }, { status: 500 })
  }
}

// Configuración para permitir archivos más grandes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}