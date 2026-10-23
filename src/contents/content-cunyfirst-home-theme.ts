import type { PlasmoCSConfig } from "plasmo"

import { cunyfirstHomeStyles } from "../features/theme/cunyfirst-home"
import { startHostTheme } from "../features/theme/host-page"

export const config: PlasmoCSConfig = {
  matches: ["https://home.cunyfirst.cuny.edu/*PT_LANDINGPAGE.GBL*"],
  run_at: "document_start"
}

startHostTheme(cunyfirstHomeStyles)
