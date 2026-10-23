import type { PlasmoCSConfig } from "plasmo"

import { cunyfirstFunctionsStyles } from "../features/theme/cunyfirst-functions"
import { startHostTheme } from "../features/theme/host-page"

export const config: PlasmoCSConfig = {
  matches: [
    "https://*.cunyfirst.cuny.edu/psc/*",
    "https://*.cunyfirst.cuny.edu/psp/*"
  ],
  run_at: "document_start"
}

// The landing page and Schedule Builder have their own tailored themes.
if (
  !location.pathname.includes("PT_LANDINGPAGE.GBL") &&
  location.hostname !== "sb.cunyfirst.cuny.edu" &&
  /^\/ps[cp]\/[^/]+\/[^/]+\/[^/]+\/c\//i.test(location.pathname)
) {
  startHostTheme(cunyfirstFunctionsStyles)
}
