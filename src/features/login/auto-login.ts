import { LOGIN_SETTING_KEYS, readLoginSettings } from "./settings"

const ATTEMPTED_KEY = "cuny_plus_autologin_attempted"
const pause = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function credentialsForm() {
  const username = document.getElementById("CUNYLoginUsernameDisplay")
  const password = document.getElementById("CUNYLoginPassword")
  const submit = document.getElementById("submit")
  if (
    !(username instanceof HTMLInputElement) ||
    !(password instanceof HTMLInputElement)
  )
    return
  if (
    !(submit instanceof HTMLButtonElement) &&
    !(submit instanceof HTMLInputElement)
  )
    return
  if (
    !username.form ||
    username.form !== password.form ||
    username.form !== submit.form
  )
    return
  if (
    username.matches(":disabled") ||
    password.matches(":disabled") ||
    submit.matches(":disabled") ||
    username.readOnly ||
    password.readOnly
  )
    return
  return { username, password, submit }
}

function fillInput(input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

/** One submission per explicit settings save, with no automatic failure retry. */
export function startAutoLogin(): () => void {
  let stopped = false
  let suspended = false
  let running = false
  let queued = false
  let generation = 0
  let activeObserver: MutationObserver | undefined

  async function attempt() {
    const startedAt = generation
    const settings = await readLoginSettings()
    if (
      stopped ||
      suspended ||
      generation !== startedAt ||
      !settings.autoLogin ||
      !settings.username ||
      !settings.password
    )
      return
    const revision = settings.autoLoginRevision || "1" // Preserve the legacy session guard.
    if (sessionStorage.getItem(ATTEMPTED_KEY) === revision) return
    const form = credentialsForm()
    if (!form) return
    let cancelled = false
    const controls = [form.username, form.password, form.submit]
    const observer = new MutationObserver((records) => {
      // Record transitions, including disable/remove then restore before the next timer.
      if (
        records.some((record) =>
          record.type === "attributes"
            ? controls.some((control) => record.target.contains(control))
            : Array.from(record.removedNodes).some((node) =>
                controls.some((control) => node.contains(control))
              )
        )
      ) {
        cancelled = true
      }
    })
    activeObserver = observer
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["disabled", "readonly", "id", "form"]
    })
    const isCurrent = () => {
      const current = credentialsForm()
      return (
        !stopped &&
        !suspended &&
        !cancelled &&
        generation === startedAt &&
        current?.username === form.username &&
        current.password === form.password &&
        current.submit === form.submit
      )
    }

    try {
      fillInput(form.username, settings.username)
      await pause(250)
      if (!isCurrent()) return
      fillInput(form.password, settings.password)
      await pause(350)
      if (!isCurrent()) return

      // A storage event may arrive after this read, so check both the saved values and generation.
      const latest = await readLoginSettings()
      if (!isCurrent() || !latest.autoLogin) return
      if (
        latest.autoLoginRevision !== settings.autoLoginRevision ||
        latest.username !== settings.username ||
        latest.password !== settings.password
      )
        return
      if (sessionStorage.getItem(ATTEMPTED_KEY) === revision) return
      sessionStorage.setItem(ATTEMPTED_KEY, revision)
      form.submit.click()
    } finally {
      observer.disconnect()
      if (activeObserver === observer) activeObserver = undefined
    }
  }

  function schedule() {
    if (stopped || suspended) return
    if (running) {
      queued = true
      return
    }
    running = true
    void attempt()
      .catch(() => {
        // No credentials or raw storage errors belong in page logs.
        console.warn(
          "[CUNY Plus] Auto-login skipped: settings or session protection unavailable."
        )
      })
      .finally(() => {
        running = false
        if (queued) {
          queued = false
          schedule()
        }
      })
  }

  const onChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string
  ) => {
    if (area !== "local" || !LOGIN_SETTING_KEYS.some((key) => key in changes))
      return
    generation++
    schedule()
  }

  function stop() {
    stopped = true
    generation++
    activeObserver?.disconnect()
    chrome.storage.onChanged.removeListener(onChange)
    window.removeEventListener("pagehide", onHide)
    window.removeEventListener("pageshow", onShow)
  }

  function onHide(event: PageTransitionEvent) {
    if (!event.persisted) {
      stop()
      return
    }
    suspended = true
    generation++
    activeObserver?.disconnect()
  }

  function onShow(event: PageTransitionEvent) {
    if (!event.persisted || !suspended) return
    suspended = false
    schedule()
  }

  chrome.storage.onChanged.addListener(onChange)
  window.addEventListener("pagehide", onHide)
  window.addEventListener("pageshow", onShow)
  schedule()
  return stop
}
