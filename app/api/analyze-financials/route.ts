import { NextResponse } from "next/server"
import { analyzeFinancialData } from "@/services/openai-service"
import { demoFinancialData } from "@/lib/salud-data"

export async function POST(request: Request) {
  try {
    // In a real app, you'd get an API key from the user's session or secure storage
    // For this demo, we'll expect it in the body, but have a fallback to env.
    const body = await request.json()
    const apiKey = body.apiKey || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
    }

    // In a real app, you'd fetch data for the specific user.
    // Here we use the hardcoded demo data.
    const analysis = await analyzeFinancialData(demoFinancialData, apiKey)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[ANALYZE_FINANCIALS_API]", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 })
  }
}
