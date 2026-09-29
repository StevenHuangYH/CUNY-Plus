// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"

import RMPButton from "../src/features/ratings/components/RMPButton"
import { startHostTheme } from "../src/features/theme/host-page"
import IndexPopup from "../src/popup"
import { connectLoginStorage, credentials } from "./login-fixture"

let stopHost: (() => void) | undefined
let portalStyle: HTMLStyleElement | undefined
afterEach(() => {
  cleanup()
  stopHost?.()
  stopHost = undefined
  portalStyle?.remove()
  portalStyle = undefined
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

it("starts light, remembers the button choice, and keeps login settings independent", async () => {
  const storage = connectLoginStorage(credentials)
  const user = userEvent.setup()
  const first = render(<IndexPopup />)
  const button = await screen.findByRole("button", { name: "Dark mode" })
  await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false))
  expect(button.getAttribute("aria-pressed")).toBe("false")
  await user.click(button)
  expect(button.getAttribute("aria-pressed")).toBe("true")
  expect(storage.set).toHaveBeenCalledExactlyOnceWith({ darkMode: true })
  expect(screen.getByDisplayValue(credentials.username)).toBeTruthy()
  first.unmount()
  render(<IndexPopup />)
  await waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Dark mode" })
        .getAttribute("aria-pressed")
    ).toBe("true")
  )
  await user.click(screen.getByRole("button", { name: "Dark mode" }))
  expect(storage.set).toHaveBeenLastCalledWith({ darkMode: false })
  expect(
    screen
      .getByRole("button", { name: "Dark mode" })
      .getAttribute("aria-pressed")
  ).toBe("false")
})

it("retains the saved appearance on a failed write and allows retry", async () => {
  const storage = connectLoginStorage({ darkMode: true })
  const user = userEvent.setup()
  render(<IndexPopup />)
  const button = screen.getByRole("button", { name: "Dark mode" })
  await waitFor(() => expect(button.getAttribute("aria-pressed")).toBe("true"))
  storage.failWrite()
  await user.click(button)
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not save appearance/i
  )
  expect(button.getAttribute("aria-pressed")).toBe("true")
  await user.click(button)
  expect(button.getAttribute("aria-pressed")).toBe("false")
  expect(screen.queryByRole("alert")).toBeNull()
})

it("reports a failed appearance read without blocking login settings", async () => {
  const storage = connectLoginStorage({ ...credentials, darkMode: true })
  storage.failRead("darkMode")
  render(<IndexPopup />)
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not load appearance/i
  )
  expect(screen.getByDisplayValue(credentials.username)).toBeTruthy()
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Dark mode" }))
  expect(screen.queryByRole("alert")).toBeNull()
})

it("updates open host pages and new page content, preserving images and calendar colors, then restores light", async () => {
  const storage = connectLoginStorage()
  // Representative original rules from the public Schedule Builder and SSO CSS.
  portalStyle = document.createElement("style")
  portalStyle.textContent = `body { background-color: #fff; color: #000; }
    .bottomAdvice, .enrollmentEncouragement, .tipbox { background-color: #fff; }
    .faculty, .campus { color: #444; }
    .row.two { background-color: #f8fafb; }
    label { color: #0c2255; }
    .form-control { background-color: #fff; }
    a { color: #000e90; }`
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `<div class="row two"><label>Username</label><input class="form-control" aria-label="Username"></div><div class="bc1" style="background-color: rgb(165, 214, 167)"><span class="faculty">Course</span></div><img alt="CUNY logo" src="logo.png"><div data-cuny-plus-ui><a href="#">Profile</a></div><div class="bottomAdvice"><span class="faculty">Instructor</span></div><div class="enrollmentEncouragement">Enroll</div><div class="tipbox"><span class="campus">Campus</span></div>`
  const originalBody = getComputedStyle(document.body).backgroundColor
  const originalBlock = getComputedStyle(
    document.querySelector(".bc1")!
  ).backgroundColor
  stopHost = startHostTheme()
  await act(async () => storage.change({ darkMode: true }))
  expect(getComputedStyle(document.body).backgroundColor).toBe(
    "rgb(32, 36, 44)"
  )
  expect(
    getComputedStyle(document.querySelector("input")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(
    getComputedStyle(document.querySelector(".bc1")!).backgroundColor
  ).toBe(originalBlock)
  expect(document.querySelector("img")!.getAttribute("src")).toBe("logo.png")
  expect(getComputedStyle(document.querySelector("img")!).filter).not.toMatch(
    /invert/
  )
  for (const panel of document.querySelectorAll(
    ".bottomAdvice, .enrollmentEncouragement, .tipbox"
  )) {
    expect(getComputedStyle(panel).backgroundColor).toBe("rgb(44, 52, 66)")
    expect(getComputedStyle(panel).color).toBe("rgb(241, 245, 249)")
  }
  expect(
    getComputedStyle(document.querySelector(".bottomAdvice .faculty")!).color
  ).toBe("rgb(219, 228, 240)")
  expect(getComputedStyle(document.querySelector(".bc1 .faculty")!).color).toBe(
    "rgb(26, 26, 46)"
  )
  expect(
    getComputedStyle(document.querySelector("[data-cuny-plus-ui] a")!).color
  ).toBe("rgb(0, 14, 144)")
  const panel = document.createElement("div")
  panel.className = "sresult"
  document.body.appendChild(panel)
  expect(getComputedStyle(panel).backgroundColor).toBe("rgb(44, 52, 66)")
  await act(async () => storage.change({ darkMode: false }))
  expect(getComputedStyle(document.body).backgroundColor).toBe(originalBody)
  expect(
    getComputedStyle(document.querySelector(".tipbox")!).backgroundColor
  ).toBe("rgb(255, 255, 255)")
  expect(getComputedStyle(document.querySelector(".faculty")!).color).toBe(
    "rgb(68, 68, 68)"
  )
})

it("keeps dark error, candidate, and rating states readable through retry and selection", async () => {
  connectLoginStorage({ darkMode: true })
  const candidate = {
    id: "1",
    legacyId: "1",
    name: "Alex Chen",
    schoolName: "Hunter College",
    profileUrl: "https://www.ratemyprofessors.com/professor/1",
    avgRating: 4.5,
    avgDifficulty: 4,
    tags: ["Clear grading"]
  }
  const sendMessage = vi
    .fn()
    .mockImplementationOnce((_message, callback) =>
      callback({ status: "error", error: "Offline" })
    )
    .mockImplementationOnce((_message, callback) =>
      callback({ status: "candidates", candidates: [candidate] })
    )
  vi.stubGlobal("chrome", {
    ...chrome,
    runtime: { ...chrome.runtime, sendMessage }
  })
  const instructor = document.createElement("div")
  instructor.textContent = "Alex Chen"
  document.body.appendChild(instructor)
  render(
    <RMPButton
      anchor={{
        element: instructor,
        type: "inline",
        insertPosition: "afterend"
      }}
    />
  )
  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: /view.*ratings/i }))
  expect(getComputedStyle(await screen.findByText(/Offline/)).color).toBe(
    "rgb(255, 163, 173)"
  )
  const retry = screen.getByRole("button", { name: "Retry search" })
  expect(getComputedStyle(retry).backgroundColor).toBe("rgb(44, 52, 66)")
  await user.click(retry)
  expect(
    getComputedStyle(screen.getByRole("link", { name: /Profile for/ })).color
  ).toBe("rgb(166, 200, 255)")
  await user.click(screen.getByRole("button", { name: /Show ratings for/ }))
  expect(getComputedStyle(screen.getByText("4.5")).color).toBe(
    "rgb(134, 231, 171)"
  )
  expect(getComputedStyle(screen.getByText("4.0 / 5")).color).toBe(
    "rgb(255, 163, 173)"
  )
  expect(screen.getByText("N/A")).toBeTruthy()
  expect(screen.getByText("Clear grading")).toBeTruthy()
})

it("updates an open professor dialog from storage without closing it or changing its contents", async () => {
  const storage = connectLoginStorage()
  vi.stubGlobal("chrome", {
    ...chrome,
    runtime: {
      ...chrome.runtime,
      sendMessage: vi.fn((_message, callback) => callback({ status: "empty" }))
    }
  })
  const instructor = document.createElement("div")
  instructor.textContent = "Alex Chen"
  document.body.appendChild(instructor)
  render(
    <RMPButton
      anchor={{
        element: instructor,
        type: "inline",
        insertPosition: "afterend"
      }}
    />
  )
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /view.*ratings/i }))
  await screen.findByText("No professor profiles found.")
  const dialog = screen.getByRole("dialog")
  expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)")
  await act(async () => storage.change({ darkMode: true }))
  expect(screen.getByRole("dialog")).toBe(dialog)
  expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(32, 36, 44)")
  expect(getComputedStyle(dialog).color).toBe("rgb(241, 245, 249)")
  await act(async () => storage.change({ darkMode: false }))
  expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)")
})

it("does not let a stale initial read overwrite a newer choice from another tab", async () => {
  const storage = connectLoginStorage()
  let finish: (data: Record<string, unknown>) => void = () => {}
  storage.get.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  stopHost = startHostTheme()
  await act(async () => storage.change({ darkMode: true }))
  await act(async () => finish({ darkMode: false }))
  expect(getComputedStyle(document.body).backgroundColor).toBe(
    "rgb(32, 36, 44)"
  )
})
