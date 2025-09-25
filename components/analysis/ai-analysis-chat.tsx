"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  TrendingUp, 
  FileText, 
  BarChart3,
  Lightbulb,
  MessageCircle,
  Clock
} from 'lucide-react';
import { ComprehensiveAnalysis } from '@/lib/analysis/mega-diagnostic-analyzer';
import { ChatMessage, AIAnalysisService } from '@/lib/analysis/ai-analysis-service';

interface AIAnalysisChatProps {
  analysis: ComprehensiveAnalysis;
  onClose: () => void;
}

export function AIAnalysisChat({ analysis, onClose }: AIAnalysisChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensaje de bienvenida
    const welcomeMessage: ChatMessage = {
      role: 'ai',
      content: `¡Hola! Soy tu consultor de IA especializado en análisis empresarial. He revisado los resultados de tu diagnóstico y estoy listo para ayudarte a interpretar los datos y desarrollar estrategias de mejora.

Tu empresa tiene una puntuación general del ${analysis.overallScore.toFixed(1)}% con ${analysis.moduleAnalyses.length} módulos analizados.

¿En qué área específica te gustaría profundizar? Puedes preguntarme sobre:
• Interpretación de resultados específicos
• Estrategias de mejora prioritarias  
• Comparación entre módulos
• Plan de acción detallado
• Mejores prácticas de la industria`,
      timestamp: new Date(),
      relatedModules: [],
      attachments: []
    };
    setMessages([welcomeMessage]);
  }, [analysis]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await AIAnalysisService.handleChatMessage(
        inputMessage.trim(),
        {
          analysis,
          conversationHistory: messages
        }
      );

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error en chat:', error);
      const errorMessage: ChatMessage = {
        role: 'ai',
        content: 'Disculpa, hubo un problema técnico. Por favor, intenta reformular tu pregunta.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convertir texto simple a formato más visual
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Detectar bullets y listas
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 mt-1">•</span>
            <span>{line.replace(/^[•\-]\s*/, '')}</span>
          </div>
        );
      }
      
      // Detectar títulos (líneas en mayúsculas o con :)
      if (line.includes(':') && line.length < 50) {
        return (
          <div key={idx} className="font-semibold text-blue-700 mt-3 mb-1">
            {line}
          </div>
        );
      }

      return line.trim() ? (
        <p key={idx} className="my-2">{line}</p>
      ) : (
        <br key={idx} />
      );
    });
  };

  const getRelatedModuleInfo = (moduleCode: string) => {
    const module = analysis.moduleAnalyses.find(m => m.moduleCode === moduleCode);
    return module ? {
      title: module.moduleTitle,
      score: ((module.averageScore / 4) * 100).toFixed(1)
    } : null;
  };

  const suggestedQuestions = [
    "¿Cuáles son mis 3 prioridades principales?",
    "¿Cómo me comparo con otras empresas?",
    "¿Qué módulo necesita más atención?",
    "Dame un plan de acción para 30 días",
    "¿Qué área está más fuerte?",
    "¿Cómo puedo mejorar mi puntuación general?"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b bg-blue-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Consultor IA - Análisis Empresarial</CardTitle>
              <p className="text-sm text-muted-foreground">
                Especializado en diagnósticos y estrategias de mejora
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensajes */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'ai' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    {formatMessage(message.content)}
                  </div>

                  {/* Módulos relacionados */}
                  {message.relatedModules && message.relatedModules.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.relatedModules.map(moduleCode => {
                        const moduleInfo = getRelatedModuleInfo(moduleCode);
                        return moduleInfo ? (
                          <Badge key={moduleCode} variant="secondary" className="text-xs">
                            {moduleInfo.title.substring(0, 20)}... ({moduleInfo.score}%)
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-xs mt-2 flex items-center gap-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de carga */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-sm text-gray-600">
                    Analizando y generando respuesta...
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Preguntas sugeridas (solo si hay pocos mensajes) */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Preguntas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setInputMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Input de mensaje */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregunta sobre tu análisis empresarial..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Presiona Enter para enviar • Shift+Enter para nueva línea
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
