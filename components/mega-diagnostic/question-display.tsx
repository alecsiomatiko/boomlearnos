"use client"

import type { MegaQuestion } from "@/types/mega-diagnostic"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface QuestionDisplayProps {
  question: MegaQuestion
  currentAnswers: string[]
  onAnswer: (questionId: string, selectedOptionIds: string[]) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
  showFeedback?: boolean
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
}: QuestionDisplayProps) {
  const handleSingleChange = (value: string) => {
    onAnswer(question.id, [value])
  }

  const handleMultipleChange = (optionId: string) => {
    const newAnswers = currentAnswers.includes(optionId)
      ? currentAnswers.filter((id) => id !== optionId)
      : [...currentAnswers, optionId]
    onAnswer(question.id, newAnswers)
  }

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <p className="text-sm text-muted-foreground mb-2">Ponderación de la pregunta: {question.ponderacionPregunta}</p>
      <h2 className="text-2xl font-semibold mb-6 text-foreground">{question.pregunta}</h2>

      {question.tipo === "single" && (
        <RadioGroup value={currentAnswers[0] || ""} onValueChange={handleSingleChange} className="space-y-3">
          {question.opciones.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${question.id}-${option.id}`}
              className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
              <span className="text-lg flex-grow">
                {option.emoji && <span className="mr-3">{option.emoji}</span>}
                {option.text}
                <span className="text-xs text-muted-foreground ml-2">(P: {option.ponderacion})</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      )}

      {question.tipo === "multiple" && (
        <div className="space-y-3">
          {question.opciones.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${question.id}-${option.id}`}
              className="flex items-center space-x-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Checkbox
                id={`${question.id}-${option.id}`}
                checked={currentAnswers.includes(option.id)}
                onCheckedChange={() => handleMultipleChange(option.id)}
              />
              <span className="text-lg flex-grow">
                {option.emoji && <span className="mr-3">{option.emoji}</span>}
                {option.text}
                <span className="text-xs text-muted-foreground ml-2">(P: {option.ponderacion})</span>
              </span>
            </Label>
          ))}
        </div>
      )}

      {showFeedback && question.feedbackImmediato && currentAnswers.length > 0 && (
        <div className="mt-6 p-4 bg-sky-900/50 border border-sky-400/30 rounded-lg">
          <p className="text-sky-300 font-medium">💡 ¡Ese dato vale oro, crack!</p>
          <p className="text-sky-400 text-sm">{question.feedbackImmediato}</p>
        </div>
      )}
      {showFeedback && question.justificacion && currentAnswers.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-400/30 rounded-lg text-xs text-yellow-400">
          <p className="font-semibold">Justificación (Backstage):</p>
          <p>{question.justificacion}</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button onClick={onPrevious} disabled={isFirst} variant="outline">
          Anterior
        </Button>
        <Button onClick={onNext} disabled={currentAnswers.length === 0 && question.tipo === "single"}>
          {isLast ? "Finalizar" : "Siguiente"}
        </Button>
      </div>
    </Card>
  )
}
