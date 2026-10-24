import { cleanProfessorName, isPlaceholder } from "./identity"
import type {
  ProfessorCandidate,
  ProfessorLookupResult,
  ProfessorQuery
} from "./types"

export interface CourseInstructorRatingState {
  course: ProfessorQuery
  result: ProfessorLookupResult | null
  rating: ProfessorCandidate | null
  loading: boolean
  contextRevision: number
}

type Lookup = (course: ProfessorQuery) => Promise<ProfessorLookupResult>

export interface CourseInstructorRating {
  getSnapshot(): CourseInstructorRatingState
  subscribe(listener: () => void): () => void
  search(lookup: Lookup): void
  select(candidate: ProfessorCandidate | null): void
}

interface CourseContext {
  entry: Element | null
  result: Element | null
  option: string | undefined
  evidence: string
  course: ProfessorQuery
}

const normalize = (value: string | null | undefined) =>
  value?.replace(/\s+/g, " ").trim() ?? ""

function readCourse(element: Element): ProfessorQuery {
  const scope = element.closest("td, [data-course]")
  const campuses = scope?.querySelectorAll(".campus_block")
  const campus =
    campuses?.length === 1 ? normalize(campuses[0].textContent) : undefined
  return {
    professorName: cleanProfessorName(element.textContent ?? ""),
    campus: campus || undefined
  }
}

function entryEvidence(entry: Element | null, result: Element | null): string {
  if (!entry) return ""
  if (!entry.matches(".course_box, [data-schedule-entry]"))
    return normalize(entry.textContent)

  const text = (selector: string) =>
    normalize(entry.querySelector(selector)?.textContent)
  return JSON.stringify({
    id: entry.id,
    classNumber: entry.getAttribute("data-class-number"),
    section: entry.getAttribute("data-section"),
    code: text(".course_title, [data-course-code]"),
    name:
      text("[data-course-name]") ||
      normalize(entry.querySelector(".course_header")?.textContent),
    meetings: Array.from(
      entry.querySelectorAll(
        "#hoursInLegend, [data-meeting], [data-async], .instructional_method_block"
      )
    ).map((meeting) => normalize(meeting.textContent)),
    term: result?.getAttribute("data-term") ?? text(".term_label")
  })
}

function readContext(element: Element): CourseContext {
  const entry =
    element.closest(".course_box, [data-schedule-entry]") ??
    element.closest("tr, [data-course]")
  const result = element.closest("[data-schedule-results], #page_results")
  const option = result?.matches("[data-schedule-results]")
    ? result.getAttribute("data-option") ?? undefined
    : normalize(
        result?.querySelector(".results-current-schedule")?.textContent
      ) || undefined
  return {
    entry,
    result,
    option,
    evidence: entryEvidence(entry, result),
    course: readCourse(element)
  }
}

function sameContext(a: CourseContext, b: CourseContext): boolean {
  return (
    a.entry === b.entry &&
    a.result === b.result &&
    a.option === b.option &&
    a.evidence === b.evidence &&
    a.course.professorName === b.course.professorName &&
    a.course.campus === b.course.campus
  )
}

class RatingSession implements CourseInstructorRating {
  private context: CourseContext
  private state: CourseInstructorRatingState
  private listeners = new Set<() => void>()
  private generation = 0
  disposed = false

  constructor(readonly element: Element) {
    this.context = readContext(element)
    this.state = {
      course: this.context.course,
      result: null,
      rating: null,
      loading: false,
      contextRevision: 0
    }
  }

  getSnapshot = (): CourseInstructorRatingState => this.state

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    registryFor(this.element.ownerDocument).add(this)
    this.refresh()
    return () => this.listeners.delete(listener)
  }

  private publish(next: CourseInstructorRatingState) {
    this.state = next
    this.listeners.forEach((listener) => listener())
  }

  refresh() {
    if (this.disposed) return
    if (!this.element.isConnected) {
      this.dispose()
      return
    }
    const next = readContext(this.element)
    if (sameContext(this.context, next)) return
    this.context = next
    this.generation++
    this.publish({
      course: next.course,
      result: null,
      rating: null,
      loading: false,
      contextRevision: this.state.contextRevision + 1
    })
  }

  search(lookup: Lookup) {
    this.refresh()
    if (this.disposed || isPlaceholder(this.state.course.professorName)) return
    registryFor(this.element.ownerDocument).add(this)
    const course = this.state.course
    const request = ++this.generation
    this.publish({
      ...this.state,
      result: null,
      rating: null,
      loading: true
    })

    const finish = (result: ProfessorLookupResult) => {
      this.refresh()
      if (this.disposed || request !== this.generation) return
      this.publish({
        ...this.state,
        result,
        rating: result.status === "matched" ? result.professor : null,
        loading: false
      })
    }
    try {
      void lookup(course).then(finish, () =>
        finish({
          status: "error",
          error: "Could not reach the extension. Please reload this page."
        })
      )
    } catch {
      finish({
        status: "error",
        error: "Could not reach the extension. Please reload this page."
      })
    }
  }

  select(candidate: ProfessorCandidate | null) {
    this.refresh()
    if (this.disposed || this.state.result?.status !== "candidates") return
    const selected = candidate
      ? this.state.result.candidates.find((item) => item.id === candidate.id)
      : null
    if (candidate && !selected) return
    this.publish({ ...this.state, rating: selected })
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.generation++
    registries.get(this.element.ownerDocument)?.remove(this)
    sessions.delete(this.element)
    this.publish({
      ...this.state,
      result: null,
      rating: null,
      loading: false,
      contextRevision: this.state.contextRevision + 1
    })
    this.listeners.clear()
  }
}

class CourseInstructorRegistry {
  private sessions = new Set<RatingSession>()
  private observer: MutationObserver
  private pending = false

  constructor(private doc: Document) {
    this.observer = new MutationObserver(() => {
      if (this.pending) return
      this.pending = true
      queueMicrotask(() => {
        this.pending = false
        for (const session of Array.from(this.sessions)) session.refresh()
      })
    })
  }

  add(session: RatingSession) {
    if (this.sessions.has(session)) return
    if (!this.sessions.size)
      this.observer.observe(this.doc, {
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class", "data-option", "data-term", "data-section"],
        subtree: true
      })
    this.sessions.add(session)
  }

  remove(session: RatingSession) {
    this.sessions.delete(session)
    if (!this.sessions.size) {
      this.observer.disconnect()
      registries.delete(this.doc)
    }
  }
}

const sessions = new WeakMap<Element, RatingSession>()
const registries = new WeakMap<Document, CourseInstructorRegistry>()

function registryFor(doc: Document): CourseInstructorRegistry {
  let registry = registries.get(doc)
  if (!registry) {
    registry = new CourseInstructorRegistry(doc)
    registries.set(doc, registry)
  }
  return registry
}

/** One rating state per course instructor element, shared by UI and copy. */
export function courseInstructorRating(
  element: Element
): CourseInstructorRating {
  let session = sessions.get(element)
  if (!session || session.disposed) {
    session = new RatingSession(element)
    sessions.set(element, session)
  }
  return session
}

/** A synchronous read never starts a professor search. */
export function recordedCourseInstructorRating(
  element: Element
): CourseInstructorRatingState | null {
  const session = sessions.get(element)
  if (!session) return null
  session.refresh()
  return session.disposed ? null : session.getSnapshot()
}
