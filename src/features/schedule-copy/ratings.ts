import { recordedCourseInstructorRating } from "../ratings/course-instructor"
import { cleanProfessorName, isPlaceholder } from "../ratings/identity"
import type { ProfessorLookupResult, RMPRating } from "../ratings/types"

export function recordedRatingLabel(
  element: Element,
  displayedName: string
): string {
  const snapshot = recordedCourseInstructorRating(element)
  if (
    !snapshot ||
    snapshot.course.professorName !== cleanProfessorName(displayedName)
  )
    return ratingLabel(displayedName, null, null, false)
  return ratingLabel(
    displayedName,
    snapshot.result,
    snapshot.rating,
    snapshot.loading
  )
}

export function ratingLabel(
  displayedName: string,
  result: ProfessorLookupResult | null,
  rating: RMPRating | null,
  loading: boolean
): string {
  if (isPlaceholder(displayedName)) return "Instructor TBA"
  if (loading) return "Searching"
  if (rating)
    return rating.avgRating === undefined ? "N/A" : String(rating.avgRating)
  switch (result?.status) {
    case "candidates":
      return "Needs confirmation"
    case "empty":
      return "No result"
    case "error":
      return "Search failed"
    default:
      return "Not searched"
  }
}
