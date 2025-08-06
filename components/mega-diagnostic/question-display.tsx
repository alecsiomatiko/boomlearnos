"use client"

import type { DiagnosticQuestion } from "@/services/diagnostic-service"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface QuestionDisplayProps {
  question: DiagnosticQuestion
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
      <p className="text-sm text-muted-foreground mb-2">Ponderación de la pregunta: {question.weight}</p>
      <h2 className="text-2xl font-semibold mb-6 text-foreground">{question.question_text}</h2>

      {question.question_type === "single" && (
        <RadioGroup value={currentAnswers[0] || ""} onValueChange={handleSingleChange} className="space-y-3">
          {question.options.map((option) => (
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
          {question.options.map((option) => (
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
