import type { PlasmoCSConfig } from "plasmo"

import { startScheduleCopy } from "../features/schedule-copy/toolbar"

export const config: PlasmoCSConfig = {
  matches: [
    "https://sb.cunyfirst.cuny.edu/*",
    "$PLASMO_PUBLIC_SIMULATOR_LOCALHOST",
    "$PLASMO_PUBLIC_SIMULATOR_LOOPBACK"
  ]
}

startScheduleCopy(document)
