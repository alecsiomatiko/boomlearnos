"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiagnosticQuestion } from "@/types/diagnostic"

interface DiagnosticQuestionProps {
  question: DiagnosticQuestion
  currentAnswer?: string[]
  onAnswer: (questionId: string, selectedOptions: string[]) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function DiagnosticQuestion({
  question,
  currentAnswer = [],
  onAnswer,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: DiagnosticQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(currentAnswer)

  const handleOptionChange = (optionId: string, checked: boolean) => {
    let newSelection: string[]

    if (question.type === "single") {
      newSelection = checked ? [optionId] : []
    } else {
      newSelection = checked ? [...selectedOptions, optionId] : selectedOptions.filter((id) => id !== optionId)
    }

    setSelectedOptions(newSelection)
    onAnswer(question.id, newSelection)
  }

  const isAnswered = selectedOptions.length > 0

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{question.question}</CardTitle>
      </CardHeader>

      <CardContent>
        {question.type === "single" ? (
          <RadioGroup value={selectedOptions[0] || ""} onValueChange={(value) => handleOptionChange(value, true)}>
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <Button
          onClick={onNext}
          disabled={!isAnswered}
          className={cn("transition-all", isAnswered && "bg-kalabasboom-red hover:bg-kalabasboom-red/90")}
        >
          {isLast ? "Finalizar" : "Siguiente"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
