import type { PlasmoCSConfig } from "plasmo"

import { startAutoLogin } from "../features/login/auto-login"

// Run only on the CUNY SSO login page
export const config: PlasmoCSConfig = {
  matches: ["https://ssologin.cuny.edu/*"],
  run_at: "document_idle"
}

startAutoLogin()
