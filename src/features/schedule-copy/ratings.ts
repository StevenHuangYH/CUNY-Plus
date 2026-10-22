import { cleanProfessorName, isPlaceholder } from "../ratings/identity"
import type { ProfessorLookupResult, RMPRating } from "../ratings/types"

interface RatingSnapshot {
  displayedName: string
  result: ProfessorLookupResult | null
  rating: RMPRating | null
  loading: boolean
}

const snapshots = new WeakMap<Element, RatingSnapshot & { context: string }>()

export function ratingContextKey(element: Element): string {
  const entry =
    element.closest(".course_box") ??
    element.closest("[data-schedule-entry], tr, [data-course]")
  const option = element.closest("[data-schedule-results]")
  const liveResult = element.closest("#page_results")
  return JSON.stringify({
    entry: entry?.textContent?.replace(/\s+/g, " ").trim(),
    option:
      option?.getAttribute("data-option") ??
      liveResult
        ?.querySelector(".results-current-schedule")
        ?.textContent?.trim(),
    name: element.textContent?.replace(/\s+/g, " ").trim()
  })
}

export function recordRatingSnapshot(
  element: Element,
  snapshot: RatingSnapshot
): void {
  snapshots.set(element, { ...snapshot, context: ratingContextKey(element) })
}

export function forgetRatingSnapshot(element: Element): void {
  snapshots.delete(element)
}

export function recordedRatingLabel(
  element: Element,
  displayedName: string
): string {
  const snapshot = snapshots.get(element)
  if (
    !snapshot ||
    snapshot.context !== ratingContextKey(element) ||
    snapshot.displayedName !== cleanProfessorName(displayedName)
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
