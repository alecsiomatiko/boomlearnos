"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

interface ProgressTrackerProps {
  currentQuestion: number
  totalQuestions: number
  answeredQuestions: Set<string>
  questions: Array<{ id: string }>
}

export function ProgressTracker({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  questions,
}: ProgressTrackerProps) {
  const progress = (answeredQuestions.size / totalQuestions) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}% completado</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
              answeredQuestions.has(question.id)
                ? "bg-green-500 text-white"
                : index === currentQuestion
                  ? "bg-kalabasboom-red text-white"
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            {answeredQuestions.has(question.id) ? <CheckCircle2 className="h-4 w-4" /> : <span>{index + 1}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
