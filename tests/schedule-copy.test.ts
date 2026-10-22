import { expect, it } from "vitest"

import { formatSchedule } from "../src/features/schedule-copy/format"
import { ratingLabel } from "../src/features/schedule-copy/ratings"

it("copies every displayed entry as readable text", () => {
  const schedule = {
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
        code: "CSC 22000",
        name: "Algorithms",
        instructors: ["Staff"],
        meetings: ["No fixed time"],
        ratings: ["Instructor TBA"]
      }
    ]
  }

  expect(formatSchedule(schedule, "text")).toBe(
    "Fall 2026 — Option 2 of 5\n\n" +
      "Course code: MGT 3120\nCourse name: Organizational Behavior\nInstructor: Hadley Black\nMeeting times:\n- Mon 9:00 AM–10:15 AM\n- Wed 9:00 AM–10:15 AM\nProfessor rating: Not searched\n\n" +
      "Course code: CSC 22000\nCourse name: Algorithms\nInstructor: Staff\nMeeting times:\n- No fixed time\nProfessor rating: Instructor TBA"
  )
})

it("copies one row per entry as five tab-separated cells", () => {
  expect(
    formatSchedule(
      {
        term: "Fall 2026",
        option: "2 of 5",
        entries: [
          {
            code: "MGT 3120",
            name: "Organizational Behavior",
            instructors: ["Hadley Black", "Taylor Lee"],
            meetings: ["Mon 9:00 AM–10:15 AM", "No fixed time"],
            ratings: ["4.2", "Needs confirmation"]
          },
          {
            code: "MGT 3120",
            name: "Organizational Behavior",
            instructors: ["Staff"],
            meetings: ["Not provided"],
            ratings: ["Instructor TBA"]
          }
        ]
      },
      "table"
    )
  ).toBe(
    "Course code\tCourse name\tInstructor\tMeeting times\tProfessor rating\n" +
      "MGT 3120\tOrganizational Behavior\tHadley Black；Taylor Lee\tMon 9:00 AM–10:15 AM；No fixed time\t4.2；Needs confirmation\n" +
      "MGT 3120\tOrganizational Behavior\tStaff\tNot provided\tInstructor TBA"
  )
})

it("distinguishes each professor lookup state without starting a search", () => {
  expect(ratingLabel("Staff", null, null, false)).toBe("Instructor TBA")
  expect(ratingLabel("Alex Chen", null, null, false)).toBe("Not searched")
  expect(ratingLabel("Alex Chen", null, null, true)).toBe("Searching")
  expect(
    ratingLabel(
      "Alex Chen",
      { status: "candidates", candidates: [] },
      null,
      false
    )
  ).toBe("Needs confirmation")
  expect(ratingLabel("Alex Chen", { status: "empty" }, null, false)).toBe(
    "No result"
  )
  expect(
    ratingLabel("Alex Chen", { status: "error", error: "offline" }, null, false)
  ).toBe("Search failed")
  expect(
    ratingLabel("Alex Chen", null, { avgRating: 4.2, tags: [] }, false)
  ).toBe("4.2")
  expect(ratingLabel("Alex Chen", null, { tags: [] }, false)).toBe("N/A")
})
