// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest"

import { recordRatingSnapshot } from "../src/features/schedule-copy/ratings"
import { readDisplayedSchedule } from "../src/features/schedule-copy/read-schedule"

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

it("uses only rating state belonging to the same entry and option", () => {
  document.body.innerHTML = `<section data-schedule-results data-option="1 of 2"><article data-schedule-entry><span data-course-code>MGT 3120</span><span data-course-name>Behavior</span><div title="Instructor(s)">Alex Chen</div></article></section>`
  const instructor = document.querySelector('[title="Instructor(s)"]')!
  const result = document.querySelector("[data-schedule-results]")!
  recordRatingSnapshot(instructor, {
    displayedName: "Alex Chen",
    result: null,
    rating: { avgRating: 4.2, tags: [] },
    loading: false
  })
  expect(readDisplayedSchedule(document).status).toBe("ready")
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["4.2"] }] }
  })
  result.setAttribute("data-option", "2 of 2")
  expect(readDisplayedSchedule(document)).toMatchObject({
    schedule: { entries: [{ ratings: ["Not searched"] }] }
  })
})

it("keeps separate instructor ratings aligned and marks a combined label unclear", () => {
  document.body.innerHTML = `<section data-schedule-results><article data-schedule-entry><span data-course-code>CSC 22000</span><span data-course-name>Algorithms</span><div title="Instructor(s)">Alex Chen</div><div title="Instructor(s)">Staff</div></article></section>`
  const first = document.querySelector('[title="Instructor(s)"]')!
  recordRatingSnapshot(first, {
    displayedName: "Alex Chen",
    result: null,
    rating: { avgRating: 4.2, tags: [] },
    loading: false
  })
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
