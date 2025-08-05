"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { QuizQuestion, QuizAnswer } from "@/types/quiz"

interface QuestionCardProps {
  question: QuizQuestion
  answer?: QuizAnswer
  onAnswer: (answer: QuizAnswer) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
  canProceed: boolean
}

export function QuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  canProceed,
}: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(answer?.selectedOptions || [])

  const handleOptionChange = (optionId: string, checked: boolean) => {
    let newSelection: string[]

    if (question.type === "single") {
      newSelection = checked ? [optionId] : []
    } else {
      newSelection = checked ? [...selectedOptions, optionId] : selectedOptions.filter((id) => id !== optionId)
    }

    setSelectedOptions(newSelection)

    const score = newSelection.reduce((total, id) => {
      const option = question.options.find((opt) => opt.id === id)
      return total + (option?.value || 0)
    }, 0)

    onAnswer({
      questionId: question.id,
      selectedOptions: newSelection,
      score: score * question.weight,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span className="px-2 py-1 bg-kalabasboom-red/10 text-kalabasboom-red rounded-full">{question.category}</span>
          <span>Peso: {question.weight}x</span>
        </div>
        <CardTitle className="text-xl text-white">{question.question}</CardTitle>
        {question.description && <p className="text-gray-400">{question.description}</p>}
      </CardHeader>

      <CardContent className="space-y-6">
        {question.type === "single" ? (
          <RadioGroup value={selectedOptions[0] || ""} onValueChange={(value) => handleOptionChange(value, true)}>
            {question.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-white/5"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer text-gray-300">
                  {option.text}
                  {option.description && <span className="block text-sm text-gray-500 mt-1">{option.description}</span>}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-white/5"
              >
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer text-gray-300">
                  {option.text}
                  {option.description && <span className="block text-sm text-gray-500 mt-1">{option.description}</span>}
                </Label>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            Anterior
          </Button>

          <Button onClick={onNext} disabled={!canProceed}>
            {isLast ? "Finalizar Quiz" : "Siguiente"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
