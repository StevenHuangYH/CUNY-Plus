// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest"

import { startScheduleCopy } from "../src/features/schedule-copy/toolbar"

afterEach(() => {
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

it("copies the currently displayed option from either button", async () => {
  document.body.innerHTML = `
    <section data-schedule-results data-option="1 of 2"><article data-schedule-entry><span data-course-code>MGT 3120</span><span data-course-name>Behavior</span><div title="Instructor(s)">Staff</div><div data-meeting>Mon 9 AM</div></article></section>
    <section data-schedule-results data-option="2 of 2" hidden><article data-schedule-entry><span data-course-code>CSC 22000</span><span data-course-name>Algorithms</span><div title="Instructor(s)">TBA</div><div data-async></div></article></section>`
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal("navigator", { clipboard: { writeText } })
  const stop = startScheduleCopy(document)
  const button = document.querySelector<HTMLButtonElement>(
    '[data-copy-format="text"]'
  )!
  button.click()
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
  expect(writeText.mock.calls[0][0]).toContain("MGT 3120")

  const [first, second] = document.querySelectorAll("[data-schedule-results]")
  first.setAttribute("hidden", "")
  second.removeAttribute("hidden")
  await vi.waitFor(() =>
    expect(second.querySelector('[data-copy-format="table"]')).not.toBeNull()
  )
  second.querySelector<HTMLButtonElement>('[data-copy-format="table"]')!.click()
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2))
  expect(writeText.mock.calls[1][0]).toBe(
    "Course code\tCourse name\tInstructor\tMeeting times\tProfessor rating\nCSC 22000\tAlgorithms\tTBA\tNo fixed time\tInstructor TBA"
  )
  stop()
})

it("places copy actions beside the live Schedule Builder legend", async () => {
  document.body.innerHTML = `<div id="page_results"><div class="results-with-schedules"><span class="results-current-schedule">1</span><span class="results-total-schedules">1</span></div><div id="flip_area"><div class="reg_legend"><div id="legend_box"><div class="course_box"><div class="legend_table computer-only"><div class="course_header"><div class="header_cell"><h4 class="course_title">MTH 4360</h4><div><span class="mobileNUmber">1-</span><span>Complexity</span></div><div id="hoursInLegend">Mon 9 AM<br></div></div></div><div class="selection_row"><div title="Instructor(s)">Staff</div></div></div></div></div></div></div></div>`
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal("navigator", { clipboard: { writeText } })
  const stop = startScheduleCopy(document)
  const legend = document.querySelector("#page_results .reg_legend")!
  const button = legend.querySelector<HTMLButtonElement>(
    '[data-copy-format="table"]'
  )!
  expect(button.disabled).toBe(false)
  button.click()
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
  expect(writeText.mock.calls[0][0]).toContain("MTH 4360\tComplexity")
  stop()
})
