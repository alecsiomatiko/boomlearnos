"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DepartmentScoreCardProps {
  title: string
  score: number
  description: string
}

export function DepartmentScoreCard({ title, score, description }: DepartmentScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-500"
  }

  return (
    <Card className="flex flex-col items-center justify-center p-4 text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-0">
        <span className={cn("text-5xl font-bold tracking-tight", getScoreColor(score))}>{score}</span>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
