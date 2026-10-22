import type { DisplayedSchedule, ScheduleEntry } from "./format"
import { recordedRatingLabel } from "./ratings"

export type ScheduleRead =
  | { status: "ready"; schedule: DisplayedSchedule }
  | { status: "empty"; reason: string }
  | { status: "unavailable"; reason: string }

export function visible(element: Element): boolean {
  for (
    let current: Element | null = element;
    current;
    current = current.parentElement
  ) {
    if (
      current.hasAttribute("hidden") ||
      current.getAttribute("aria-hidden") === "true" ||
      (current instanceof HTMLElement && current.style.display === "none") ||
      current.ownerDocument.defaultView?.getComputedStyle(current).display ===
        "none"
    )
      return false
  }
  return true
}

function lines(element: Element): string[] {
  const parts = [""]
  const visit = (node: Node) => {
    if (node.nodeName === "BR") {
      parts.push("")
    } else if (node.nodeType === 3) {
      parts[parts.length - 1] += node.textContent ?? ""
    } else {
      node.childNodes.forEach(visit)
    }
  }
  element.childNodes.forEach(visit)
  return parts.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean)
}

function instructorsIn(entry: Element, selector: string) {
  const elements = Array.from(entry.querySelectorAll(selector)).filter(visible)
  const names = elements.length ? elements.flatMap(lines) : ["Not provided"]
  if (!names.length) names.push("Not provided")
  const combinedName =
    (elements.length === 1 && names.length > 1) ||
    (names.length === 1 && /[,;；\n]|\s(?:and|&)\s/i.test(names[0]))
  return {
    names,
    ratings:
      !elements.length || combinedName
        ? ["Identity unclear"]
        : names.map((name, index) => recordedRatingLabel(elements[index], name))
  }
}

function value(element: Element, selector: string): string {
  return (
    element.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ||
    "Not provided"
  )
}

function readEntry(element: Element): ScheduleEntry {
  const instructor = instructorsIn(element, '[title="Instructor(s)"]')
  const meetings = Array.from(element.querySelectorAll("[data-meeting]"))
    .map((meeting) => meeting.textContent?.replace(/\s+/g, " ").trim())
    .filter((meeting): meeting is string => Boolean(meeting))
  if (element.querySelector("[data-async]")) meetings.push("No fixed time")
  return {
    code: value(element, "[data-course-code]"),
    name: value(element, "[data-course-name]"),
    instructors: instructor.names,
    meetings: meetings.length ? meetings : ["Not provided"],
    ratings: instructor.ratings
  }
}

function readLiveEntry(element: Element): ScheduleEntry {
  const header = element.querySelector(
    ".legend_table.computer-only .course_header"
  )
  const nameContainer = header?.querySelector(".mobileNUmber")?.parentElement
  const name = Array.from(nameContainer?.querySelectorAll("span") ?? [])
    .filter((span) => !span.classList.contains("mobileNUmber"))
    .map((span) => span.textContent?.replace(/\s+/g, " ").trim())
    .find(Boolean)
  const instructor = instructorsIn(
    element,
    '.legend_table.computer-only .selection_row [title="Instructor(s)"]'
  )
  const hours = Array.from(
    header?.querySelectorAll("#hoursInLegend") ?? []
  ).flatMap(lines)
  const meetings = hours.map((hour) =>
    /\b(?:online[- ]?)?asynchronous\b/i.test(hour) ? "No fixed time" : hour
  )
  const methods = Array.from(
    element.querySelectorAll(
      ".legend_table.computer-only .selection_row .instructional_method_block"
    )
  )
  if (
    methods.some((method) => /asynchronous/i.test(method.textContent ?? "")) &&
    !meetings.includes("No fixed time")
  )
    meetings.push("No fixed time")
  return {
    code:
      header?.querySelector(".course_title")?.textContent?.trim() ||
      "Not provided",
    name: name || "Not provided",
    instructors: instructor.names,
    meetings: meetings.length ? meetings : ["Not provided"],
    ratings: instructor.ratings
  }
}

function readLiveSchedule(result: Element): ScheduleRead {
  const loading = result.querySelector("#flap_loading2")
  if (loading && visible(loading))
    return { status: "unavailable", reason: "Schedule results are loading." }
  const flip = result.querySelector("#flip_area")
  if (!flip || !visible(flip))
    return {
      status: "unavailable",
      reason: "Cannot identify one complete displayed schedule."
    }
  const legends = Array.from(flip.querySelectorAll("#legend_box")).filter(
    visible
  )
  if (legends.length !== 1)
    return {
      status: "unavailable",
      reason: "Cannot identify one complete displayed schedule."
    }
  const boxes = Array.from(legends[0].children).filter(
    (child) => child.classList.contains("course_box") && visible(child)
  )
  if (!boxes.length)
    return { status: "empty", reason: "No courses to copy in this schedule." }
  const terms = Array.from(
    legends[0].querySelectorAll(".course_box .term_label")
  )
    .map((term) => term.textContent?.replace(/:\s*$/, "").trim())
    .filter((term): term is string => Boolean(term))
  const term = new Set(terms).size === 1 ? terms[0] : undefined
  const current = result
    .querySelector(".results-current-schedule")
    ?.textContent?.trim()
  const total = result
    .querySelector(".results-total-schedules")
    ?.textContent?.trim()
  const option =
    current && total && /^\d+$/.test(current) && /^\d+$/.test(total)
      ? `${current} of ${total}`
      : undefined
  return {
    status: "ready",
    schedule: { term, option, entries: boxes.map(readLiveEntry) }
  }
}

/** Reads a result only when its container explicitly identifies a whole option. */
export function readDisplayedSchedule(root: Document | Element): ScheduleRead {
  const results = Array.from(
    root.querySelectorAll("[data-schedule-results]")
  ).filter(visible)
  if (!results.length) {
    const live = Array.from(root.querySelectorAll("#page_results")).filter(
      visible
    )
    if (live.length === 1) return readLiveSchedule(live[0])
  }
  if (results.length !== 1)
    return {
      status: "unavailable",
      reason: "Cannot identify one complete displayed schedule."
    }
  const result = results[0]
  const entries = Array.from(result.querySelectorAll("[data-schedule-entry]"))
    .filter(visible)
    .map(readEntry)
  if (!entries.length)
    return { status: "empty", reason: "No courses to copy in this schedule." }
  return {
    status: "ready",
    schedule: {
      term: result.getAttribute("data-term") || undefined,
      option: result.getAttribute("data-option") || undefined,
      entries
    }
  }
}
