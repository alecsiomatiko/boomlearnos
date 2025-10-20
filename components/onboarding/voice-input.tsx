"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Play, Pause, RotateCcw, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface VoiceInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function VoiceInput({ value, onChange, placeholder, className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Óptimo para Whisper
          channelCount: 1,   // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      // Usar formato compatible con Whisper
      const options = {
        mimeType: 'audio/webm;codecs=opus', // Mejor compresión y calidad
        audioBitsPerSecond: 128000
      }
      
      // Fallback si webm no está soportado
      const mimeType = MediaRecorder.isTypeSupported(options.mimeType) 
        ? options.mimeType 
        : 'audio/wav'
      
      mediaRecorder.current = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 
      })
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: mimeType })
        setAudioBlob(blob)
        transcribeAudio(blob)
        
        // Detener el stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.current.start(1000) // Guardar chunks cada segundo
      setIsRecording(true)
      toast({
        title: "🎤 Grabando...",
        description: "Habla claramente sobre tu respuesta. OpenAI Whisper está escuchando.",
      })
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono. Verifica los permisos.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true)
    try {
      // Crear FormData para enviar el audio a OpenAI Whisper
      const formData = new FormData()
      formData.append('audio', blob, 'audio.wav')
      
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onChange(result.transcription)
        toast({
          title: "✅ Transcripción completada",
          description: "Tu audio se ha convertido a texto con OpenAI Whisper",
        })
      } else {
        throw new Error(result.error || 'Error en transcripción')
      }
    } catch (error: any) {
      console.error('Error transcribiendo audio:', error)
      toast({
        title: "Error en transcripción",
        description: error.message || "No se pudo procesar el audio",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const improveWithAI = async () => {
    if (!value.trim()) {
      toast({
        title: "Escribe algo primero",
        description: "Necesitas texto para mejorar con IA",
        variant: "destructive",
      })
      return
    }

    setIsImproving(true)
    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: value,
          style: 'jony_ive' // Estilo inspirado en las presentaciones de Jony Ive
        }),
      })

      const result = await response.json()

      if (result.success) {
        onChange(result.improvedText)
        toast({
          title: "✨ Texto mejorado",
          description: "Tu respuesta ha sido refinada con IA",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo mejorar el texto",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const clearAll = () => {
    onChange("")
    setAudioBlob(null)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] resize-none"
      />
      
      <div className="flex flex-wrap gap-2">
        {/* Botón de grabación */}
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className="gap-2"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isRecording ? "Detener" : "Grabar"}
        </Button>

        {/* Control de reproducción */}
        {audioBlob && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={isPlaying ? pauseAudio : playAudio}
            className="gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pausar" : "Reproducir"}
          </Button>
        )}

        {/* Botón de IA para mejorar */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={improveWithAI}
          disabled={!value.trim() || isImproving}
          className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
        >
          <Sparkles className={`h-4 w-4 ${isImproving ? 'animate-spin' : ''}`} />
          {isImproving ? "Mejorando..." : "Mejorar con IA"}
        </Button>

        {/* Limpiar */}
        {(value || audioBlob) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Estados */}
      <div className="flex gap-2">
        {isRecording && (
          <Badge variant="destructive" className="gap-1 animate-pulse">
            🔴 Grabando...
          </Badge>
        )}
        {isTranscribing && (
          <Badge variant="secondary" className="gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
            Transcribiendo con OpenAI Whisper...
          </Badge>
        )}
        {audioBlob && !isTranscribing && !isRecording && (
          <Badge variant="outline" className="gap-1">
            ✅ Audio transcrito
          </Badge>
        )}
        {value && value.trim() && !audioBlob && (
          <Badge variant="outline" className="gap-1">
            📝 Texto escrito
          </Badge>
        )}
      </div>
    </div>
  )
}