import { useRef, useState } from "react"

import { setDarkMode } from "./store"
import { useTheme } from "./useTheme"

export function DarkModeButton() {
  const { dark, ready, error: loadError, colors } = useTheme()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const writing = useRef(false)

  async function toggle() {
    if (!ready || writing.current) return
    writing.current = true
    setSaving(true)
    setError("")
    try {
      await setDarkMode(!dark)
    } catch {
      setError("Could not save appearance. Try again.")
    } finally {
      writing.current = false
      setSaving(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        aria-pressed={dark}
        disabled={!ready || saving}
        onClick={() => void toggle()}
        style={{
          padding: "7px 12px",
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          background: dark ? "#1B3A6B" : colors.subtle,
          color: dark ? "#FFFFFF" : colors.text,
          font: "inherit",
          fontSize: 12,
          fontWeight: 600,
          cursor: !ready || saving ? "wait" : "pointer"
        }}>
        Dark mode
      </button>
      {(error || loadError) && (
        <p
          role="alert"
          style={{ color: colors.danger, fontSize: 11, marginBottom: 0 }}>
          {error || loadError}
        </p>
      )}
    </div>
  )
}
