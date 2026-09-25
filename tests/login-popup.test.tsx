// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"

import IndexPopup from "../src/popup"
import { connectLoginStorage, credentials } from "./login-fixture"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it("retains credentials and reports a failed save instead of showing Saved", async () => {
  const storage = connectLoginStorage()
  storage.failWrite()
  const user = userEvent.setup()
  render(<IndexPopup />)
  await screen.findByDisplayValue(credentials.username)
  await user.click(screen.getByRole("button", { name: "Save" }))
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not save/i
  )
  expect(screen.queryByRole("button", { name: /saved/i })).toBeNull()
  expect(screen.getByDisplayValue(credentials.password)).toBeTruthy()
  await user.click(screen.getByRole("button", { name: "Save" }))
  expect(await screen.findByRole("button", { name: /saved/i })).toBeTruthy()
})

it("keeps the switch and credentials intact when disabling cannot be saved", async () => {
  const storage = connectLoginStorage()
  storage.failWrite()
  const user = userEvent.setup()
  render(<IndexPopup />)
  await screen.findByDisplayValue(credentials.username)
  await user.click(screen.getByRole("switch"))
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not.*disable/i
  )
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true")
  expect(screen.getByDisplayValue(credentials.password)).toBeTruthy()
  await user.click(screen.getByRole("switch"))
  await waitFor(() =>
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "false"
    )
  )
  expect(storage.set).toHaveBeenLastCalledWith(
    expect.objectContaining({ autoLogin: false, username: "", password: "" })
  )
})

it("blocks editing after a failed initial read and lets the user retry loading", async () => {
  const storage = connectLoginStorage()
  storage.failRead()
  const user = userEvent.setup()
  render(<IndexPopup />)
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not load/i
  )
  expect(screen.getByRole("switch").hasAttribute("disabled")).toBe(true)
  await user.click(screen.getByRole("button", { name: /retry loading/i }))
  expect(await screen.findByDisplayValue(credentials.username)).toBeTruthy()
  expect(storage.set).not.toHaveBeenCalled()
})

it("prevents overlapping writes and clears Saved when the user edits again", async () => {
  const storage = connectLoginStorage()
  let finish: () => void = () => {}
  storage.set.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      })
  )
  const user = userEvent.setup()
  render(<IndexPopup />)
  await screen.findByDisplayValue(credentials.username)
  await user.click(screen.getByRole("button", { name: "Save" }))
  expect(screen.getByRole("switch").hasAttribute("disabled")).toBe(true)
  expect(
    screen.getByRole("button", { name: /saving/i }).hasAttribute("disabled")
  ).toBe(true)
  await user.click(screen.getByRole("switch"))
  expect(storage.set).toHaveBeenCalledTimes(1)
  await act(async () => finish())
  expect(await screen.findByRole("button", { name: /saved/i })).toBeTruthy()
  await user.type(screen.getByDisplayValue(credentials.username), "2")
  expect(screen.getByRole("button", { name: "Save" })).toBeTruthy()
})

it("creates a fresh non-secret retry token only when settings are saved", async () => {
  const storage = connectLoginStorage()
  const user = userEvent.setup()
  render(<IndexPopup />)
  await screen.findByDisplayValue(credentials.username)
  expect(storage.set).not.toHaveBeenCalled()
  await user.click(screen.getByRole("button", { name: "Save" }))
  const saved = await screen.findByRole("button", { name: /saved/i })
  const first = storage.set.mock.calls[0][0].autoLoginRevision
  expect(first).toEqual(expect.any(String))
  expect(first).not.toBe(credentials.password)
  await user.click(saved)
  await waitFor(() => expect(storage.set).toHaveBeenCalledTimes(2))
  expect(storage.set.mock.calls[1][0].autoLoginRevision).not.toBe(first)
})
