// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest"

import { courseInstructorRating } from "../src/features/ratings/course-instructor"
import { readDisplayedSchedule } from "../src/features/schedule-copy/read-schedule"

const candidate = {
  id: "professor-1",
  legacyId: "1",
  name: "Alex Chen",
  schoolName: "Baruch College",
  profileUrl: "https://www.ratemyprofessors.com/professor/1",
  avgRating: 4.2,
  tags: []
}

afterEach(() => {
  document.body.innerHTML = ""
})

it("reads only the active option and preserves separate entries", () => {
  document.body.innerHTML = `
    <section data-schedule-results data-term="Fall 2026" data-option="2 of 5">
      <article data-schedule-entry>
        <strong data-course-code>MGT 3120</strong><span data-course-name>Organizational Behavior</span>
        <div title="Instructor(s)">Hadley Black</div>
        <div data-meeting>Mon 9:00 AM–10:15 AM</div><div data-meeting>Wed 9:00 AM–10:15 AM</div>
      </article>
      <article data-schedule-entry>
        <strong data-course-code>MGT 3120</strong><span data-course-name>Organizational Behavior</span>
        <div title="Instructor(s)">Staff</div><div data-async>Online-Asynchronous</div>
      </article>
    </section>
    <section data-schedule-results hidden data-option="3 of 5"><article data-schedule-entry>Other option</article></section>`

  expect(readDisplayedSchedule(document)).toEqual({
    status: "ready",
    schedule: {
      term: "Fall 2026",
      option: "2 of 5",
      entries: [
        {
          code: "MGT 3120",
          name: "Organizational Behavior",
          instructors: ["Hadley Black"],
          meetings: ["Mon 9:00 AM–10:15 AM", "Wed 9:00 AM–10:15 AM"],
          ratings: ["Not searched"]
        },
        {
          code: "MGT 3120",
          name: "Organizational Behavior",
          instructors: ["Staff"],
          meetings: ["No fixed time"],
          ratings: ["Instructor TBA"]
        }
      ]
    }
  })
})

it("rejects an ambiguous schedule boundary", () => {
  document.body.innerHTML = `<section data-schedule-results></section><section data-schedule-results></section>`
  expect(readDisplayedSchedule(document)).toEqual({
    status: "unavailable",
    reason: "Cannot identify one complete displayed schedule."
  })
})

it("uses only a rating belonging to the same entry and option", async () => {
  document.body.innerHTML = `<section data-schedule-results data-option="1 of 2"><article data-schedule-entry><span data-course-code>MGT 3120</span><span data-course-name>Behavior</span><div title="Instructor(s)">Alex Chen</div></article></section>`
  const instructor = document.querySelector('[title="Instructor(s)"]')!
  const result = document.querySelector("[data-schedule-results]")!
  courseInstructorRating(instructor).search(async () => ({
    status: "matched",
    professor: candidate
  }))
  await vi.waitFor(() =>
    expect(readDisplayedSchedule(document)).toMatchObject({
      schedule: { entries: [{ ratings: ["4.2"] }] }
    })
  )
  expect(readDisplayedSchedule(document).status).toBe("ready")
  result.setAttribute("data-option", "2 of 2")
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Not searched"] }] }
  })
})

it("keeps separate instructor ratings aligned and marks a combined label unclear", async () => {
  document.body.innerHTML = `<section data-schedule-results><article data-schedule-entry><span data-course-code>CSC 22000</span><span data-course-name>Algorithms</span><div title="Instructor(s)">Alex Chen</div><div title="Instructor(s)">Staff</div></article></section>`
  const first = document.querySelector('[title="Instructor(s)"]')!
  courseInstructorRating(first).search(async () => ({
    status: "matched",
    professor: candidate
  }))
  await vi.waitFor(() =>
    expect(readDisplayedSchedule(document)).toMatchObject({
      schedule: { entries: [{ ratings: ["4.2", "Instructor TBA"] }] }
    })
  )
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: {
      entries: [
        {
          instructors: ["Alex Chen", "Staff"],
          ratings: ["4.2", "Instructor TBA"]
        }
      ]
    }
  })

  document.querySelector("article")!.innerHTML =
    `<span data-course-code>CSC 22000</span><span data-course-name>Algorithms</span><div title="Instructor(s)">Alex Chen, Taylor Lee</div>`
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: {
      entries: [
        {
          instructors: ["Alex Chen, Taylor Lee"],
          ratings: ["Identity unclear"]
        }
      ]
    }
  })
})

it("keeps a chosen rating through unrelated text but drops it when entry evidence changes", async () => {
  document.body.innerHTML = `<section data-schedule-results data-option="1 of 2"><article data-schedule-entry><span data-course-code>MGT 3120</span><span data-course-name>Behavior</span><div title="Instructor(s)">Alex Chen</div><div data-meeting>Mon 9 AM</div><span data-status>Seats open</span></article></section>`
  const instructor = document.querySelector('[title="Instructor(s)"]')!
  const rating = courseInstructorRating(instructor)
  rating.search(async () => ({ status: "candidates", candidates: [candidate] }))
  await vi.waitFor(() =>
    expect(readDisplayedSchedule(document)).toMatchObject({
      schedule: { entries: [{ ratings: ["Needs confirmation"] }] }
    })
  )
  rating.select(candidate)
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["4.2"] }] }
  })

  document.querySelector("[data-status]")!.textContent = "Seats closed"
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["4.2"] }] }
  })

  document.querySelector("[data-meeting]")!.textContent = "Tue 9 AM"
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Not searched"] }] }
  })
})

it("does not copy a late rating or reuse it after the instructor element is replaced", async () => {
  document.body.innerHTML = `<section data-schedule-results data-option="1 of 2"><article data-schedule-entry><span data-course-code>MGT 3120</span><span data-course-name>Behavior</span><div title="Instructor(s)">Alex Chen</div></article></section>`
  const instructor = document.querySelector('[title="Instructor(s)"]')!
  let respond!: (result: {
    status: "matched"
    professor: typeof candidate
  }) => void
  courseInstructorRating(instructor).search(
    () => new Promise((resolve) => (respond = resolve))
  )
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Searching"] }] }
  })

  document
    .querySelector("[data-schedule-results]")!
    .setAttribute("data-option", "2 of 2")
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Not searched"] }] }
  })
  respond({ status: "matched", professor: candidate })
  await Promise.resolve()
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Not searched"] }] }
  })

  instructor.replaceWith(instructor.cloneNode(true))
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Not searched"] }] }
  })
})

it("marks missing fields without inventing an instructor rating", () => {
  document.body.innerHTML = `<section data-schedule-results><article data-schedule-entry><span data-course-code>CSC 22000</span></article></section>`
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: {
      entries: [
        {
          code: "CSC 22000",
          name: "Not provided",
          instructors: ["Not provided"],
          meetings: ["Not provided"],
          ratings: ["Identity unclear"]
        }
      ]
    }
  })
})
