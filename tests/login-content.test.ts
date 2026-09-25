// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import { connectLoginStorage, credentials } from "./login-fixture"

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
  sessionStorage.clear()
})

afterEach(() => {
  window.dispatchEvent(new Event("pagehide"))
  document.body.innerHTML = ""
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function loginForm() {
  document.body.innerHTML =
    '<form><input id="CUNYLoginUsernameDisplay"><input id="CUNYLoginPassword" type="password"><button id="submit" type="submit">Login</button></form>'
  const username = document.querySelector<HTMLInputElement>(
    "#CUNYLoginUsernameDisplay"
  )!
  const password =
    document.querySelector<HTMLInputElement>("#CUNYLoginPassword")!
  const submit = vi.fn((event: Event) => event.preventDefault())
  document.querySelector("form")!.addEventListener("submit", submit)
  return { username, password, submit }
}

it("permits one new login after a deliberate settings save while blocking repeat redirects", async () => {
  const storage = connectLoginStorage()
  const form = loginForm()
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(1)

  storage.change({
    password: "corrected-synthetic-password",
    autoLoginRevision: "saved-revision-2"
  })
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(2)
  expect(form.password.value).toBe("corrected-synthetic-password")

  window.dispatchEvent(new Event("pagehide"))
  vi.resetModules()
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(2)
  expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).not.toContain(
    credentials.password
  )
})

it("cancels old credentials when a new save arrives during form filling", async () => {
  const storage = connectLoginStorage()
  const form = loginForm()
  const submittedPasswords: string[] = []
  document
    .querySelector("form")!
    .addEventListener("submit", () =>
      submittedPasswords.push(form.password.value)
    )
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(300)
  storage.change({
    password: "new-synthetic-password",
    autoLoginRevision: "saved-revision-2"
  })
  await vi.advanceTimersByTimeAsync(1500)
  expect(submittedPasswords).toEqual(["new-synthetic-password"])
  expect(form.submit).toHaveBeenCalledTimes(1)
})

it.each(["disabled", "removed", "pagehide"])(
  "cancels a pending submission when the form is %s",
  async (reason) => {
    const storage = connectLoginStorage()
    const form = loginForm()
    await import("../src/contents/content-login")
    await vi.advanceTimersByTimeAsync(300)
    if (reason === "disabled")
      storage.change({
        autoLogin: false,
        username: "",
        password: "",
        autoLoginRevision: "disabled-revision"
      })
    if (reason === "removed")
      document.body.innerHTML = "<p>Enter your verification code</p>"
    if (reason === "pagehide") window.dispatchEvent(new Event("pagehide"))
    await vi.advanceTimersByTimeAsync(1000)
    expect(form.submit).not.toHaveBeenCalled()
    expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).toBeNull()
  }
)

it("skips incomplete and disabled forms without consuming the saved attempt", async () => {
  const storage = connectLoginStorage()
  const form = loginForm()
  form.password.remove()
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).not.toHaveBeenCalled()
  expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).toBeNull()
  const complete = loginForm()
  complete.password.disabled = true
  storage.change({ autoLoginRevision: "saved-revision-2" })
  await vi.advanceTimersByTimeAsync(1000)
  expect(complete.submit).not.toHaveBeenCalled()
  expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).toBeNull()
})

it("does not submit when reading settings or persisting the session guard fails", async () => {
  const storage = connectLoginStorage()
  const form = loginForm()
  storage.failRead()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).not.toHaveBeenCalled()
  vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
    throw new Error("Synthetic unavailable session storage")
  })
  storage.change({ autoLoginRevision: "saved-revision-2" })
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).not.toHaveBeenCalled()
  expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).toBeNull()
})

it("honors an existing legacy attempt until the user saves settings again", async () => {
  const { autoLoginRevision: _revision, ...legacy } = credentials
  const storage = connectLoginStorage(legacy)
  const form = loginForm()
  sessionStorage.setItem("cuny_plus_autologin_attempted", "1")
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).not.toHaveBeenCalled()
  storage.change({ autoLoginRevision: "first-versioned-save" })
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(1)
})

it("does not consume an attempt while the whole login fieldset is disabled", async () => {
  connectLoginStorage()
  const form = loginForm()
  const container = document.querySelector("form")!
  const fieldset = document.createElement("fieldset")
  fieldset.disabled = true
  fieldset.append(...container.childNodes)
  container.append(fieldset)
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).not.toHaveBeenCalled()
  expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).toBeNull()
})

it("cancels permanently when a pending form is briefly disabled and re-enabled", async () => {
  connectLoginStorage()
  const form = loginForm()
  const button = document.querySelector<HTMLButtonElement>("#submit")!
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(300)
  button.disabled = true
  await vi.advanceTimersByTimeAsync(80)
  button.disabled = false
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).not.toHaveBeenCalled()
  expect(sessionStorage.getItem("cuny_plus_autologin_attempted")).toBeNull()
})

it("resumes explicit-save retries after a page is restored from the back-forward cache", async () => {
  const storage = connectLoginStorage()
  const form = loginForm()
  await import("../src/contents/content-login")
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(1)
  window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }))
  window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(1)
  storage.change({ autoLoginRevision: "save-after-restoration" })
  await vi.advanceTimersByTimeAsync(1000)
  expect(form.submit).toHaveBeenCalledTimes(2)
})
