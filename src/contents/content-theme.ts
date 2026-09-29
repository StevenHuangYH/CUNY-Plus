import type { PlasmoCSConfig } from "plasmo"

import { startHostTheme } from "../features/theme/host-page"

export const config: PlasmoCSConfig = {
  matches: ["https://sb.cunyfirst.cuny.edu/*", "https://ssologin.cuny.edu/*"],
  run_at: "document_start"
}

// Keep the subscription alive across back/forward-cache restores.
startHostTheme()
