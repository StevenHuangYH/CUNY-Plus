// @vitest-environment jsdom
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { PlasmoCSUIProps } from "plasmo"
import { afterEach, expect, it, vi } from "vitest"

import { fetchRMPRating } from "../src/features/ratings/api/rmp-api"
import RMPButton from "../src/features/ratings/components/RMPButton"
import { professor, searchResponse } from "./fixtures"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

function course(name = "Alex Chen", campus = "Hunter College") {
  const table = document.createElement("table")
  table.innerHTML = `<tbody><tr><td><div class="campus_block"></div><div title="Instructor(s)" class="rightnclear"></div></td></tr></tbody>`
  document.body.appendChild(table)
  const school = table.querySelector(".campus_block")!
  const instructor = table.querySelector('[title="Instructor(s)"]')!
  school.textContent = campus
  instructor.textContent = name
  const anchor: NonNullable<PlasmoCSUIProps["anchor"]> = {
    element: instructor,
    type: "inline",
    insertPosition: "afterend"
  }
  return { anchor, school, instructor }
}

function connectSearch(nodes = [professor()]) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(Response.json(searchResponse(nodes)))
      )
  )
  const sendMessage = vi.fn((message, callback) => {
    void fetchRMPRating(message.payload).then(callback)
  })
  vi.stubGlobal("chrome", { runtime: { sendMessage } })
  return sendMessage
}

it("lets the student choose a cross-campus candidate and retains that choice on reopen", async () => {
  const sendMessage = connectSearch()
  const user = userEvent.setup()
  render(<RMPButton anchor={course().anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  const choose = await screen.findByRole("button", {
    name: "Show ratings for Alex Chen at Baruch College"
  })
  expect(screen.queryByText("Overall Quality")).toBeNull()
  expect(
    screen
      .getByRole("link", { name: "Profile for Alex Chen at Baruch College" })
      .getAttribute("href")
  ).toBe("https://www.ratemyprofessors.com/professor/1")
  await user.click(choose)
  expect(screen.getByText("Overall Quality")).toBeTruthy()
  expect(screen.getByText("0%")).toBeTruthy()
  await user.click(screen.getByRole("button", { name: "Close ratings" }))
  await user.click(screen.getByTitle(/view.*ratings/i))
  expect(screen.getByText("Overall Quality")).toBeTruthy()
  expect(sendMessage).toHaveBeenCalledTimes(1)
  await user.click(
    screen.getByRole("button", { name: "Choose another professor" })
  )
  expect(screen.queryByText("Overall Quality")).toBeNull()
})

it("reads only the instructor's own campus and clears a selection when that campus changes", async () => {
  connectSearch()
  const user = userEvent.setup()
  course("Different Person", "Baruch College")
  const current = course()
  render(<RMPButton anchor={current.anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  await user.click(
    await screen.findByRole("button", {
      name: "Show ratings for Alex Chen at Baruch College"
    })
  )
  await act(async () => {
    current.school.textContent = "Queens College"
  })
  expect(screen.queryByRole("dialog")).toBeNull()
  await user.click(screen.getByTitle(/view.*ratings/i))
  expect(await screen.findByText(/Course campus: Queens College/)).toBeTruthy()
  expect(screen.queryByText("Overall Quality")).toBeNull()
})

it("ignores a response for an instructor who changed while the search was pending", async () => {
  const callbacks: Array<(result: unknown) => void> = []
  vi.stubGlobal("chrome", {
    runtime: { sendMessage: (_message, callback) => callbacks.push(callback) }
  })
  const user = userEvent.setup()
  const current = course()
  render(<RMPButton anchor={current.anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  await act(async () => {
    current.instructor.textContent = "Other Instructor"
  })
  await user.click(screen.getByTitle(/ratings for Other Instructor/i))
  await act(async () => {
    callbacks[1]({ status: "empty" })
  })
  await act(async () => {
    callbacks[0]({ status: "error", error: "Old instructor error" })
  })
  expect(screen.getByText("No professor profiles found.")).toBeTruthy()
  expect(screen.queryByText("Old instructor error")).toBeNull()
})

it("automatically shows an exact match and retries a failed query", async () => {
  connectSearch()
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(Response.json(searchResponse([professor()])))
  )
  const user = userEvent.setup()
  render(<RMPButton anchor={course("Alex Chen", "Baruch College").anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  await user.click(await screen.findByRole("button", { name: "Retry search" }))
  expect(await screen.findByText("Overall Quality")).toBeTruthy()
  expect(within(screen.getByRole("dialog")).getByText("Alex Chen")).toBeTruthy()
})

it("does not render or query a placeholder course instructor", () => {
  const sendMessage = connectSearch()
  render(<RMPButton anchor={course("Staff").anchor} />)
  expect(screen.queryByRole("button")).toBeNull()
  expect(sendMessage).not.toHaveBeenCalled()
})

it("attributes a manually selected non-CUNY profile to its own name and school", async () => {
  connectSearch([
    professor({
      firstName: "Alexander",
      school: { name: "Example University" }
    })
  ])
  const user = userEvent.setup()
  render(<RMPButton anchor={course().anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  await user.click(
    await screen.findByRole("button", {
      name: "Show ratings for Alexander Chen at Example University"
    })
  )
  const card = screen.getByRole("dialog", {
    name: "Professor ratings for Alexander Chen"
  })
  expect(within(card).getByText("Alexander Chen")).toBeTruthy()
  expect(within(card).getByText("Example University")).toBeTruthy()
  expect(within(card).queryByText("Alex Chen")).toBeNull()
})

it("requires a new choice after the page is recreated", async () => {
  connectSearch()
  const user = userEvent.setup()
  const current = course()
  const firstPage = render(<RMPButton anchor={current.anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  await user.click(
    await screen.findByRole("button", {
      name: "Show ratings for Alex Chen at Baruch College"
    })
  )
  firstPage.unmount()
  render(<RMPButton anchor={current.anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  expect(
    await screen.findByRole("button", {
      name: "Show ratings for Alex Chen at Baruch College"
    })
  ).toBeTruthy()
  expect(screen.queryByText("Overall Quality")).toBeNull()
})

it("keeps a closed loading card closed when the response arrives", async () => {
  let respond: (response: unknown) => void
  vi.stubGlobal("chrome", {
    runtime: {
      sendMessage: (_message, callback) => {
        respond = callback
      }
    }
  })
  const user = userEvent.setup()
  render(<RMPButton anchor={course().anchor} />)
  await user.click(screen.getByTitle(/view.*ratings/i))
  await user.click(screen.getByRole("button", { name: "Close ratings" }))
  await act(async () => {
    respond({ status: "empty" })
  })
  expect(screen.queryByRole("dialog")).toBeNull()
})
