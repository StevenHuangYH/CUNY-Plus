import { formatSchedule } from "./format"
import { readDisplayedSchedule, visible } from "./read-schedule"

/** Keeps the actions beside the visible result while Schedule Builder changes options. */
export function startScheduleCopy(doc: Document): () => void {
  const toolbar = doc.createElement("div")
  toolbar.setAttribute("data-cuny-plus-ui", "")
  toolbar.setAttribute("aria-label", "Copy displayed schedule")
  toolbar.style.cssText =
    "display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 0;font:13px system-ui,sans-serif;"
  const buttons = (["text", "table"] as const).map((format) => {
    const button = doc.createElement("button")
    button.type = "button"
    button.dataset.copyFormat = format
    button.textContent = format === "text" ? "Copy text" : "Copy table"
    button.style.cssText =
      "border:1px solid #1b3a6b;border-radius:6px;background:#1b3a6b;color:white;padding:6px 10px;cursor:pointer;"
    button.addEventListener("click", async () => {
      const current = readDisplayedSchedule(doc)
      if (current.status !== "ready") {
        status.textContent = current.reason
        return
      }
      try {
        const clipboard = doc.defaultView?.navigator.clipboard
        if (!clipboard?.writeText) throw new Error("Clipboard unavailable")
        await clipboard.writeText(formatSchedule(current.schedule, format))
        status.textContent = `Copied ${format}.`
      } catch {
        status.textContent = "Could not copy. Please retry."
      }
    })
    toolbar.appendChild(button)
    return button
  })
  const status = doc.createElement("span")
  status.setAttribute("role", "status")
  toolbar.appendChild(status)

  const sync = () => {
    const results = Array.from(doc.querySelectorAll("[data-schedule-results]"))
    const live = doc.querySelector("#page_results")
    const liveLegend = live?.querySelector("#flip_area .reg_legend")
    const host =
      results.find(visible) ??
      (liveLegend && visible(liveLegend) ? liveLegend : null) ??
      results[0] ??
      live
    if (host && toolbar.parentElement !== host)
      host.insertBefore(toolbar, host.firstChild)
    if (!host && toolbar.isConnected) toolbar.remove()
    const current = readDisplayedSchedule(doc)
    const disabled = current.status !== "ready"
    for (const button of buttons)
      if (button.disabled !== disabled) button.disabled = disabled
    const message = disabled ? current.reason : ""
    if (status.textContent !== message) status.textContent = message
  }

  let pending = false
  const observer = new MutationObserver((changes) => {
    if (changes.every((change) => toolbar.contains(change.target))) return
    if (pending) return
    pending = true
    queueMicrotask(() => {
      pending = false
      sync()
    })
  })
  if (doc.body)
    observer.observe(doc.body, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    })
  sync()
  return () => {
    observer.disconnect()
    toolbar.remove()
  }
}
