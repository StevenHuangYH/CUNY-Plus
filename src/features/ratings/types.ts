export interface ProfessorQuery {
  professorName: string
  campus?: string
}

export interface RMPRating {
  avgRating?: number
  avgDifficulty?: number
  wouldTakeAgainPercent?: number
  numRatings?: number
  tags: string[]
}

export interface ProfessorCandidate extends RMPRating {
  id: string
  legacyId: string
  name: string
  schoolName: string
  profileUrl: string
}

export type ProfessorLookupResult =
  | { status: "matched"; professor: ProfessorCandidate }
  | { status: "candidates"; candidates: ProfessorCandidate[] }
  | { status: "empty" }
  | { status: "skipped" }
  | { status: "error"; error: string }
