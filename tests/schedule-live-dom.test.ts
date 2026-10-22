// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest"

import { readDisplayedSchedule } from "../src/features/schedule-copy/read-schedule"

afterEach(() => {
  document.body.innerHTML = ""
})

it("reads the current Schedule Builder legend rather than the selected-course list", () => {
  document.body.innerHTML = `
    <div id="page_criteria"><div>MTH 9999 Other selected course</div></div>
    <div id="page_results">
      <div class="results-with-schedules">Result <div><span class="results-current-schedule">2</span> of <span class="results-total-schedules">4</span></div></div>
      <div id="flip_area"><div class="reg_legend"><div id="legend_box">
        <div class="course_box"><div class="legend_table computer-only"><div class="course_header"><div class="header_cell">
          <h4 class="course_title">MTH 4360</h4><div><span class="term_label">2026 Fall Term:</span></div>
          <div><span class="mobileNUmber">1-</span><span>Complexity and Computational Models</span></div>
          <div id="hoursInLegend">Mon, Wed : 12:25 PM to 2:05 PM<br>Fri : 1:00 PM to 2:00 PM<br></div>
        </div></div><div class="selection_row"><table><tbody><tr><td><div title="Instructor(s)">Hadley Black</div></td></tr></tbody></table></div></div></div>
        <div class="course_box"><div class="legend_table computer-only"><div class="course_header"><div class="header_cell">
          <h4 class="course_title">ENV 1003</h4><div><span class="term_label">2026 Fall Term:</span></div>
          <div><span class="mobileNUmber">2-</span><span>Ecology</span></div>
          <div id="hoursInLegend">Online-Asynchronous<br></div>
        </div></div><div class="selection_row"><table><tbody><tr><td><div title="Instructor(s)">Staff</div><div class="instructional_method_block">Online-Asynchronous</div></td></tr></tbody></table></div></div></div>
      </div></div></div>
    </div>`

  expect(readDisplayedSchedule(document)).toEqual({
    status: "ready",
    schedule: {
      term: "2026 Fall Term",
      option: "2 of 4",
      entries: [
        {
          code: "MTH 4360",
          name: "Complexity and Computational Models",
          instructors: ["Hadley Black"],
          meetings: [
            "Mon, Wed : 12:25 PM to 2:05 PM",
            "Fri : 1:00 PM to 2:00 PM"
          ],
          ratings: ["Not searched"]
        },
        {
          code: "ENV 1003",
          name: "Ecology",
          instructors: ["Staff"],
          meetings: ["No fixed time"],
          ratings: ["Instructor TBA"]
        }
      ]
    }
  })
})

it("preserves separately displayed instructor names when one field contains line breaks", () => {
  document.body.innerHTML = `<div id="page_results"><div id="flip_area"><div id="legend_box"><div class="course_box"><div class="legend_table computer-only"><div class="course_header"><h4 class="course_title">BIO 1000</h4></div><div class="selection_row"><div title="Instructor(s)">Alex One<br>Blair Two</div></div></div></div></div></div></div>`
  const result = readDisplayedSchedule(document)
  expect(result.status).toBe("ready")
  if (result.status !== "ready") return
  expect(result.schedule.entries[0].instructors).toEqual([
    "Alex One",
    "Blair Two"
  ])
  expect(result.schedule.entries[0].ratings).toEqual(["Identity unclear"])
})
