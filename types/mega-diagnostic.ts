export interface MegaOption {
  id: string
  text: string
  ponderacion: number
  emoji?: string
}

export interface MegaQuestion {
  id: string
  pregunta: string
  ponderacionPregunta: number
  tipo: "single" | "multiple"
  opciones: MegaOption[]
  feedbackImmediato?: string
  opcional?: boolean
  subPreguntaDe?: string
}

export interface MegaSubmodule {
  id: string
  titulo: string
  preguntas: MegaQuestion[]
}

export interface MegaModule {
  id: string
  titulo: string
  icon?: string
  descripcion?: string
  submodules: MegaSubmodule[]
}

export interface MegaEtapa {
  id: string
  titulo: string
  descripcion: string
  desbloquea?: string
  questions?: MegaQuestion[]
  modules?: MegaModule[]
}

export interface UserMegaDiagnosticProfile {
  perfilGeneral?: string
  modulo0Result?: {
    perfilProposito?: string
    completed?: boolean // Added to track completion
  }
  etapa1Result?: {
    perfil: string
    score: DiagnosticScore
    completed?: boolean // Added to track completion
  }
  etapa2ModuleResults?: Record<string, ModuleResult>
}

export interface AnswerPayload {
  etapaId: string
  moduleId?: string
  submoduleId?: string
  questionId: string
  selectedOptionIds: string[]
}

export interface DiagnosticScore {
  score: number
  maxScore: number
  percentage: number
}

export interface ModuleResult extends DiagnosticScore {
  level: string
  recommendations: string[]
  badge?: string
  moduleName?: string // Added for ResultSummary
  completed?: boolean // Added to track completion
}
