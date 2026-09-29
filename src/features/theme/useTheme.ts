import { useSyncExternalStore } from "react"

import { getTheme, subscribeTheme } from "./store"

const light = {
  surface: "#FFFFFF",
  text: "#1a1a2e",
  muted: "#555F70",
  subtle: "#EEF2F8",
  border: "#D1D5DB",
  link: "#1B3A6B",
  hover: "#D6E0F0",
  focus: "#2563EB",
  success: "#15803D",
  warning: "#B45309",
  danger: "#B91C1C",
  successBg: "#F0FDF4",
  warningBg: "#FFFBEB",
  dangerBg: "#FFF1F2"
}
const dark: typeof light = {
  surface: "#20242C",
  text: "#F1F5F9",
  muted: "#B7C2D2",
  subtle: "#2C3442",
  border: "#56647A",
  link: "#A6C8FF",
  hover: "#394960",
  focus: "#93C5FD",
  success: "#86E7AB",
  warning: "#FCD37A",
  danger: "#FFA3AD",
  successBg: "#183A2A",
  warningBg: "#40331C",
  dangerBg: "#42252D"
}

export function useTheme() {
  const state = useSyncExternalStore(subscribeTheme, getTheme)
  return { ...state, colors: state.dark ? dark : light }
}
