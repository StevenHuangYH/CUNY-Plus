import type { PlasmoCSConfig } from "plasmo"

// Run only on the CUNY SSO login page
export const config: PlasmoCSConfig = {
  matches: ["https://ssologin.cuny.edu/*"],
  run_at: "document_idle"
}

// Session-scoped key to prevent re-triggering on a failed login redirect
const ATTEMPTED_KEY = "cuny_plus_autologin_attempted"

/**
 * Sets a value on a plain HTML input element and dispatches the events
 * the page's own JS listens for (clears inline validation errors, etc.)
 */
function fillInput(el: HTMLInputElement, value: string): void {
  el.value = value
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
}

async function attemptAutoLogin(): Promise<void> {
  // Guard: only attempt once per browser session to avoid infinite loops
  // when credentials are wrong and the page redirects back to login.
  if (sessionStorage.getItem(ATTEMPTED_KEY)) {
    console.log("[CUNY Plus] Auto-login already attempted this session — skipping.")
    return
  }

  const data = await chrome.storage.local.get(["autoLogin", "username", "password"])

  if (!data.autoLogin) return
  if (!data.username || !data.password) {
    console.warn("[CUNY Plus] Auto-login enabled but credentials not set.")
    return
  }

  // Confirm we are on the username/password login form
  // (not another page under ssologin.cuny.edu such as the MFA/TOTP page)
  const usernameInput = document.getElementById("CUNYLoginUsernameDisplay") as HTMLInputElement | null
  const passwordInput = document.getElementById("CUNYLoginPassword") as HTMLInputElement | null
  const submitButton = document.getElementById("submit") as HTMLButtonElement | null

  if (!usernameInput || !passwordInput || !submitButton) {
    // Not the credentials form — do nothing
    return
  }

  console.log("[CUNY Plus] Auto-login: filling credentials…")

  // Mark as attempted BEFORE submitting so a failed-login redirect back to
  // this page won't trigger a second attempt.
  sessionStorage.setItem(ATTEMPTED_KEY, "1")

  // Fill username (page JS will strip @login.cuny.edu on submit automatically)
  fillInput(usernameInput, data.username)

  // Small delay so the page's own focus / validation handlers settle
  await new Promise<void>((res) => setTimeout(res, 250))

  fillInput(passwordInput, data.password)

  // Another short delay for visual feedback before submitting
  await new Promise<void>((res) => setTimeout(res, 350))

  console.log("[CUNY Plus] Auto-login: submitting form…")
  submitButton.click()
}

attemptAutoLogin()
