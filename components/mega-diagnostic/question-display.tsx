"use client"

import type { DiagnosticQuestion, DiagnosticOption } from "@/services/diagnostic-service"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useResponseManager } from "@/hooks/use-response-manager"
import { useEffect, useState } from "react"

interface QuestionDisplayProps {
  question: DiagnosticQuestion
  currentAnswers: string[]
  onAnswer: (questionId: string, selectedOptionIds: string[]) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
  showFeedback?: boolean
  moduleId?: string // Agregamos moduleId para auto-guardado
}

export function QuestionDisplay({
  question,
  currentAnswers,
  onAnswer,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  showFeedback = true,
  moduleId,
}: QuestionDisplayProps) {
  const { saveSingleResponse, isAuthenticated } = useResponseManager();
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSingleChange = async (value: string) => {
    onAnswer(question.id, [value]);
    
    // Auto-guardar la respuesta si el usuario está autenticado
    if (isAuthenticated && moduleId) {
      await autoSaveResponse(value);
    }
  };

  const handleMultipleChange = async (optionId: string) => {
    const newAnswers = currentAnswers.includes(optionId)
      ? currentAnswers.filter((id) => id !== optionId)
      : [...currentAnswers, optionId];
    
    onAnswer(question.id, newAnswers);
    
    // Para preguntas múltiples, guardamos la primera opción seleccionada
    // (esto puede mejorarse para manejar respuestas múltiples)
    if (isAuthenticated && moduleId && newAnswers.length > 0) {
      await autoSaveResponse(newAnswers[0]);
    }
  };

  const autoSaveResponse = async (selectedOptionCode: string) => {
    try {
      setAutoSaveStatus('saving');
      
      // Encontrar el ID de la opción seleccionada
      const selectedOption = options.find(opt => opt.option_code === selectedOptionCode);
      if (!selectedOption) {
        console.warn('⚠️ Opción no encontrada para auto-guardado:', selectedOptionCode);
        return;
      }

      const success = await saveSingleResponse(
        parseInt(question.id), 
        parseInt(selectedOption.id)
      );
      
      setAutoSaveStatus(success ? 'saved' : 'error');
      
      // Resetear estado después de 2 segundos
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('❌ Error en auto-guardado:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }
  };

  // Debug: Log the question structure
  console.log('Question object:', question);
  console.log('Question options:', question.options);
  console.log('Options type:', typeof question.options);

  // Ensure options is an array
  const options: DiagnosticOption[] = Array.isArray(question.options) 
    ? question.options 
    : (typeof question.options === 'string' 
        ? JSON.parse(question.options) 
        : []);

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-muted-foreground">Ponderación de la pregunta: {question.weight}</p>
        {autoSaveStatus !== 'idle' && (
          <div className="text-xs px-2 py-1 rounded-full">
            {autoSaveStatus === 'saving' && <span className="text-blue-500">💾 Guardando...</span>}
            {autoSaveStatus === 'saved' && <span className="text-green-500">✅ Guardado</span>}
            {autoSaveStatus === 'error' && <span className="text-red-500">❌ Error</span>}
          </div>
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-6 text-foreground">{question.question_text}</h2>

      {question.question_type === "single" && (
        <RadioGroup value={currentAnswers[0] || ""} onValueChange={handleSingleChange} className="space-y-3">
          {options.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${question.id}-${option.id}`}
              className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={option.option_code} id={`${question.id}-${option.id}`} />
              <span className="text-lg flex-grow">
                {option.emoji && <span className="mr-3">{option.emoji}</span>}
                {option.option_text}
                <span className="text-xs text-muted-foreground ml-2">(P: {option.weight})</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      )}

      {question.question_type === "multiple" && (
        <div className="space-y-3">
          {options.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${question.id}-${option.id}`}
              className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Checkbox
                id={`${question.id}-${option.id}`}
                checked={currentAnswers.includes(option.option_code)}
                onCheckedChange={() => handleMultipleChange(option.option_code)}
              />
              <span className="text-lg flex-grow">
                {option.emoji && <span className="mr-3">{option.emoji}</span>}
                {option.option_text}
                <span className="text-xs text-muted-foreground ml-2">(P: {option.weight})</span>
              </span>
            </Label>
          ))}
        </div>
      )}

      {showFeedback && question.feedback_text && currentAnswers.length > 0 && (
        <div className="mt-6 p-4 bg-sky-900/50 border border-sky-400/30 rounded-lg">
          <p className="text-sky-300 font-medium">💡 ¡Ese dato vale oro, crack!</p>
          <p className="text-sky-400 text-sm">{question.feedback_text}</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button onClick={onPrevious} disabled={isFirst} variant="outline">
          Anterior
        </Button>
        <Button onClick={onNext} disabled={currentAnswers.length === 0 && question.question_type === "single"}>
          {isLast ? "Finalizar" : "Siguiente"}
        </Button>
      </div>
    </Card>
  )
}
