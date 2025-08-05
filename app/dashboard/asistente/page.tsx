"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, Bot, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "¡Hola! Soy tu asistente de KALABASBOOM OS. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Recuperar datos del usuario del localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    // Scroll al último mensaje
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Obtener información del contexto
      const corporateIdentity = localStorage.getItem("corporateIdentity")
      const diagnosticResults = localStorage.getItem("diagnosticResults")

      // Llamar a la API para obtener respuesta del asistente
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.role !== "system"), userMessage],
          user: user,
          corporateIdentity: corporateIdentity ? JSON.parse(corporateIdentity) : null,
          diagnosticResults: diagnosticResults ? JSON.parse(diagnosticResults) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al comunicarse con el asistente")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Lo siento, no pude procesar tu solicitud en este momento.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error with assistant:", error)
      setError("Hubo un problema al comunicarse con el asistente. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Asistente Virtual</h1>
          <p className="text-muted-foreground mt-2">
            Tu asistente personal potenciado por IA para ayudarte con KALABASBOOM OS
          </p>
        </div>

        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Asistente KALABASBOOM</CardTitle>
                <CardDescription>Potenciado por IA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)] px-4">
              <div className="space-y-4 pt-1 pb-3">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role !== "user" && message.role !== "system" && (
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.role === "system"
                            ? "bg-muted"
                            : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="ml-2 h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 max-w-[80%] bg-muted">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                        <div
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-3">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </CardFooter>
        </Card>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Sugerencias de preguntas:</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("¿Cómo puedo mejorar mi productividad con KALABASBOOM OS?")}
            >
              ¿Cómo mejorar mi productividad?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("¿Qué significan mis métricas de rendimiento?")}
            >
              Explicar mis métricas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Dame ideas para mejorar mi misión empresarial")}
            >
              Mejorar mi misión
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("¿Cómo puedo usar el sistema de gamificación?")}
            >
              Sistema de gamificación
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
