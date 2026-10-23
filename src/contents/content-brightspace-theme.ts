import type { PlasmoCSConfig } from "plasmo"

import { startBrightspaceTheme } from "../features/theme/brightspace"

export const config: PlasmoCSConfig = {
  matches: ["https://brightspace.cuny.edu/d2l/*"],
  run_at: "document_start"
}

// Content viewers and direct course files keep their author-provided styling.
// Plasmo's default top-frame injection also leaves embedded tools alone.
if (
  !/\/viewContent\/[^/]+\/View\/?$/i.test(location.pathname) &&
  !/\/viewFile\.d2l$/i.test(location.pathname)
) {
  startBrightspaceTheme()
}
