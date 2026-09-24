import { useEffect, useRef, useState } from "react"

import { cleanProfessorName, isPlaceholder } from "./identity"
import type {
  ProfessorCandidate,
  ProfessorLookupResult,
  ProfessorQuery
} from "./types"

function readCourse(element?: Element): ProfessorQuery {
  const scope = element?.closest("td, [data-course]")
  const campuses = scope?.querySelectorAll(".campus_block")
  const campus =
    campuses?.length === 1
      ? campuses[0].textContent?.replace(/\s+/g, " ").trim()
      : undefined
  return {
    professorName: cleanProfessorName(element?.textContent ?? ""),
    campus: campus || undefined
  }
}

/** Keeps a lookup and a student's choice tied to the live course context. */
export function useProfessorLookup(element?: Element) {
  const [course, setCourse] = useState(() => readCourse(element))
  const [result, setResult] = useState<ProfessorLookupResult | null>(null)
  const [selected, setSelected] = useState<ProfessorCandidate | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    let key = JSON.stringify(readCourse(element))
    const reset = () => {
      requestId.current++
      setCourse(readCourse(element))
      setResult(null)
      setSelected(null)
      setLoading(false)
      setOpen(false)
    }
    reset()
    const observer = new MutationObserver(() => {
      const next = JSON.stringify(readCourse(element))
      if (next !== key) {
        key = next
        reset()
      }
    })
    const scope =
      element?.closest("tr, [data-course]") ?? element?.parentElement
    if (scope)
      observer.observe(scope, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      })
    return () => {
      requestId.current++
      observer.disconnect()
    }
  }, [element])

  const search = () => {
    const input = readCourse(element)
    if (isPlaceholder(input.professorName)) return
    const key = JSON.stringify(input)
    const currentId = ++requestId.current
    setCourse(input)
    setLoading(true)
    setResult(null)
    setSelected(null)
    setOpen(true)

    const finish = (response: ProfessorLookupResult) => {
      if (
        currentId !== requestId.current ||
        key !== JSON.stringify(readCourse(element))
      )
        return
      setResult(response)
      setLoading(false)
    }
    try {
      chrome.runtime.sendMessage(
        { type: "FETCH_PROFESSOR_RATING", payload: input },
        (response: ProfessorLookupResult | undefined) => {
          const error = chrome.runtime.lastError
          finish(
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
      finish({
        status: "error",
        error: "Could not reach the extension. Please reload this page."
      })
    }
  }

  const rating =
    selected ?? (result?.status === "matched" ? result.professor : null)
  return {
    course,
    result,
    rating,
    loading,
    open,
    setOpen,
    search,
    select: setSelected
  }
}
