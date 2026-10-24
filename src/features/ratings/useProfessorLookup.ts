import { useEffect, useMemo, useState, useSyncExternalStore } from "react"

import {
  courseInstructorRating,
  type CourseInstructorRatingState
} from "./course-instructor"
import type {
  ProfessorCandidate,
  ProfessorLookupResult,
  ProfessorQuery
} from "./types"

function requestProfessorRating(
  course: ProfessorQuery
): Promise<ProfessorLookupResult> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        { type: "FETCH_PROFESSOR_RATING", payload: course },
        (response: ProfessorLookupResult | undefined) => {
          const error = chrome.runtime.lastError
          resolve(
            error || !response
              ? {
                  status: "error",
                  error:
                    "Could not reach the extension. Please retry or reload this page."
                }
              : response
          )
        }
      )
    } catch {
      resolve({
        status: "error",
        error: "Could not reach the extension. Please reload this page."
      })
    }
  })
}

const empty: CourseInstructorRatingState = {
  course: { professorName: "" },
  result: null,
  rating: null,
  loading: false,
  contextRevision: 0
}
const subscribeNone = () => () => {}
const getEmpty = () => empty

/** Binds a course instructor rating to React without owning its state. */
export function useProfessorLookup(element?: Element) {
  const session = useMemo(
    () => (element ? courseInstructorRating(element) : null),
    [element]
  )
  const state = useSyncExternalStore(
    session?.subscribe ?? subscribeNone,
    session?.getSnapshot ?? getEmpty
  )
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [session, state.contextRevision])

  const search = () => {
    if (!session) return
    session.search(requestProfessorRating)
    setOpen(true)
  }

  const select = (candidate: ProfessorCandidate | null) =>
    session?.select(candidate)

  return {
    course: state.course,
    result: state.result,
    rating: state.rating,
    loading: state.loading,
    open,
    setOpen,
    search,
    select
  }
}
