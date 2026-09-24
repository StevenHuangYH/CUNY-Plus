export function professor(overrides: Record<string, unknown> = {}) {
  return {
    id: "Teacher-1",
    legacyId: 1,
    firstName: "Alex",
    lastName: "Chen",
    school: { id: "School-1", name: "Baruch College" },
    avgRating: 4.2,
    avgDifficulty: 3.1,
    wouldTakeAgainPercent: 0,
    numRatings: 12,
    ratings: { edges: [{ node: { ratingTags: "Tough grader--Helpful" } }] },
    ...overrides
  }
}

export function searchResponse(nodes: ReturnType<typeof professor>[]) {
  return {
    data: {
      newSearch: { teachers: { edges: nodes.map((node) => ({ node })) } }
    }
  }
}
