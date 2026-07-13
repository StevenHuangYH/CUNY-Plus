export interface RMPRating {
  avgRating?: number
  avgDifficulty?: number
  wouldTakeAgainPercent?: number
  numRatings?: number
  legacyId?: string
  id?: string
  schoolName?: string
}

export interface RMPRatingPayload {
  success: boolean
  avgRating?: number
  avgDifficulty?: number
  wouldTakeAgainPercent?: number
  numRatings?: number
  legacyId?: string
  id?: string
  schoolName?: string
  error?: string
}
