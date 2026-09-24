import { cleanProfessorName, isPlaceholder } from "../identity"
import type {
  ProfessorCandidate,
  ProfessorLookupResult,
  ProfessorQuery
} from "../types"

const QUERY = `
  query NewSearchTeachersQuery($text: String!) {
    newSearch {
      teachers(query: {text: $text}) {
        edges {
          node {
            id
            legacyId
            firstName
            lastName
            avgRating
            avgDifficulty
            wouldTakeAgainPercent
            numRatings
            school { name }
            ratings(first: 20) { edges { node { ratingTags } } }
          }
        }
      }
    }
  }
`

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      "RateMyProfessors returned an unexpected response. Please retry."
    )
  }
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A professor profile is incomplete. Please retry.")
  }
  return value.replace(/\s+/g, " ").trim()
}

function score(value: unknown, min: number, max: number): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : undefined
}

function parseCandidate(value: unknown): ProfessorCandidate {
  const node = record(value)
  const legacyId = String(node.legacyId)
  if (!/^[1-9]\d*$/.test(legacyId))
    throw new Error("A professor profile is incomplete. Please retry.")
  const tags = new Map<string, number>()
  if (node.ratings != null) {
    const edges = record(node.ratings).edges
    if (!Array.isArray(edges))
      throw new Error("Rating information is incomplete. Please retry.")
    for (const edge of edges) {
      const rawTags = record(record(edge).node).ratingTags
      if (rawTags == null || rawTags === "") continue
      if (typeof rawTags !== "string")
        throw new Error("Rating information is incomplete. Please retry.")
      for (const rawTag of rawTags.split("--")) {
        const tag = rawTag
          .trim()
          .split(/\s+/)
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
        if (tag) tags.set(tag, (tags.get(tag) ?? 0) + 1)
      }
    }
  }
  const count = score(node.numRatings, 0, Number.MAX_SAFE_INTEGER)
  const numRatings =
    count !== undefined && Number.isInteger(count) ? count : undefined
  return {
    id: text(node.id),
    legacyId,
    name: `${text(node.firstName)} ${text(node.lastName)}`,
    schoolName: text(record(node.school).name),
    profileUrl: `https://www.ratemyprofessors.com/professor/${legacyId}`,
    avgRating: numRatings === 0 ? undefined : score(node.avgRating, 1, 5),
    avgDifficulty:
      numRatings === 0 ? undefined : score(node.avgDifficulty, 1, 5),
    wouldTakeAgainPercent:
      numRatings === 0 ? undefined : score(node.wouldTakeAgainPercent, 0, 100),
    numRatings,
    tags: [...tags].sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
  }
}

const normalizeSchool = (name: string) =>
  name.replace(/\s+/g, " ").trim().toLowerCase()

// Explicit names from https://www.cuny.edu/about/colleges/ (2026-09-24).
// Unrecognized aliases stay selectable, but never authorize an automatic match.
const CUNY_CAMPUSES = new Set(
  [
    "Baruch College",
    "Borough of Manhattan Community College",
    "Bronx Community College",
    "Brooklyn College",
    "College of Staten Island",
    "Craig Newmark Graduate School of Journalism",
    "CUNY Graduate Center",
    "CUNY Graduate School of Public Health and Health Policy",
    "CUNY School of Labor and Urban Studies",
    "CUNY School of Law",
    "CUNY School of Medicine",
    "CUNY School of Professional Studies",
    "Guttman Community College",
    "Hostos Community College",
    "Hunter College",
    "John Jay College of Criminal Justice",
    "Kingsborough Community College",
    "LaGuardia Community College",
    "Lehman College",
    "Macaulay Honors College",
    "Medgar Evers College",
    "New York City College of Technology",
    "New York City College of Technology (City Tech)",
    "Queens College",
    "Queensborough Community College",
    "The City College of New York",
    "York College"
  ].map(normalizeSchool)
)

/** One lookup owns profile attribution, matching, and all remote failure states. */
export async function fetchRMPRating(
  input: ProfessorQuery
): Promise<ProfessorLookupResult> {
  const professorName = cleanProfessorName(input.professorName)
  if (isPlaceholder(professorName)) return { status: "skipped" }

  const controller = new AbortController()
  let timeout: ReturnType<typeof setTimeout>
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error("The professor search timed out. Please retry."))
      controller.abort()
    }, 10_000)
  })

  try {
    const request = async () => {
      const response = await fetch("https://www.ratemyprofessors.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic dGVzdDp0ZXN0"
        },
        body: JSON.stringify({
          query: QUERY,
          variables: { text: professorName }
        }),
        signal: controller.signal
      })
      if (!response.ok)
        throw new Error("RateMyProfessors is unavailable. Please retry.")
      return response.json() as Promise<unknown>
    }
    const json = record(await Promise.race([request(), deadline]))
    if (
      json.errors != null &&
      (!Array.isArray(json.errors) || json.errors.length > 0)
    ) {
      throw new Error(
        "RateMyProfessors could not complete this search. Please retry."
      )
    }
    const teachers = record(record(record(json.data).newSearch).teachers)
    if (!Array.isArray(teachers.edges))
      throw new Error(
        "RateMyProfessors returned an unexpected response. Please retry."
      )
    if (teachers.edges.length === 0) return { status: "empty" }

    const profiles = teachers.edges.map((edge) =>
      parseCandidate(record(edge).node)
    )
    const candidates = [
      ...new Map(
        profiles.map((profile) => [profile.legacyId, profile])
      ).values()
    ]
    const campus = input.campus ? normalizeSchool(input.campus) : ""
    const nameParts = professorName.split(" ")
    const hasFullName =
      nameParts.length >= 2 &&
      nameParts.every((part) => /^[\p{L}][\p{L}\p{M}'’-]+$/u.test(part))
    const matches = candidates.filter(
      (candidate) =>
        hasFullName &&
        candidate.name.toLowerCase() === professorName.toLowerCase() &&
        CUNY_CAMPUSES.has(campus) &&
        normalizeSchool(candidate.schoolName) === campus
    )
    return matches.length === 1
      ? { status: "matched", professor: matches[0] }
      : { status: "candidates", candidates }
  } catch (error) {
    return {
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "The professor search failed. Please retry."
    }
  } finally {
    clearTimeout(timeout!)
  }
}
