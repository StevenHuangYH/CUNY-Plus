// Brightspace platform tokens flow into its web components' shadow roots.
// Keep brand, status, course imagery, and embedded content in their own colors.
import { startHostTheme } from "./host-page"
import { getTheme, subscribeTheme } from "./store"

const root = "html[data-cuny-plus-dark]"
const platform = (selectors: string) =>
  `${root} :is(${selectors}):not([data-cuny-plus-ui], [data-cuny-plus-ui] *)`

export const brightspaceStyles = `
${root} {
  color-scheme: dark;
  background-color: #20242c !important;
  --d2l-theme-background-color-base: #2c3442 !important;
  --d2l-theme-background-color-elevated: #323b4b !important;
  --d2l-theme-background-color-floating: #323b4b !important;
  --d2l-theme-background-color-sunken: #20242c !important;
  --d2l-theme-backdrop-background-color: #20242c !important;
  --d2l-theme-backdrop-dialog-color: #2c3442 !important;
  --d2l-theme-background-color-interactive-faint-default: #2c3442 !important;
  --d2l-theme-background-color-interactive-faint-hover: #394960 !important;
  --d2l-theme-background-color-interactive-highlighted: #284a70 !important;
  --d2l-theme-background-color-interactive-secondary-default: #394960 !important;
  --d2l-theme-background-color-interactive-secondary-hover: #4b5d75 !important;
  --d2l-theme-background-color-interactive-tertiary-hover: #394960 !important;
  --d2l-theme-badge-background-color: #394960 !important;
  --d2l-theme-badge-text-color: #f1f5f9 !important;
  --d2l-theme-border-color-standard: #56647a !important;
  --d2l-theme-border-color-subtle: #46546a !important;
  --d2l-theme-border-color-emphasized: #8895a8 !important;
  --d2l-theme-border-color-focus: #93c5fd !important;
  --d2l-theme-text-color-static-standard: #f1f5f9 !important;
  --d2l-theme-text-color-static-subtle: #dbe4f0 !important;
  --d2l-theme-text-color-static-faint: #b7c2d2 !important;
  --d2l-theme-text-color-static-disabled: #aab5c5 !important;
  --d2l-theme-text-color-interactive-default: #a6c8ff !important;
  --d2l-theme-text-color-interactive-hover: #c7ddff !important;
  --d2l-theme-icon-color-standard: #dbe4f0 !important;
  --d2l-theme-icon-color-faint: #aab5c5 !important;
  --d2l-theme-icon-color-active: #a6c8ff !important;
  --d2l-theme-status-color-success-text: #86e7ab !important;
  --d2l-theme-status-color-warning-text: #fcd37a !important;
}
${root} body {
  background-color: #20242c !important;
  color: #f1f5f9 !important;
}
${platform(`.d2l-navigation-s, .d2l-widget, .d2l-tile, .d2l-table,
  .d2l-dialog, .d2l-popup, [role="dialog"]`)} {
  background-color: #2c3442 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${platform(".d2l-page-main")} { background-color: #20242c !important; color: #f1f5f9 !important; }
${platform(".d2l-course-banner")} { background-color: #2c3442 !important; color: #f1f5f9 !important; }
${platform("h1, h2, h3, h4, h5, h6, .d2l-heading-title, .d2l-table th, .d2l-table td")} {
  color: #f1f5f9 !important;
}
${platform("a:not(.d2l-branding-navigation-background-color *)")} { color: #a6c8ff !important; }
${platform(`input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]):not([type=button]),
  select, textarea, option`)} {
  background-color: #20242c !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${platform("input, textarea")}::placeholder { color: #b7c2d2 !important; opacity: 1; }
${platform("button.d2l-button:not(.d2l-button-primary)")} {
  background-color: #394960 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${platform("a, button, input, select, textarea")}:focus-visible {
  outline: 2px solid #93c5fd !important;
  outline-offset: 2px;
}
${platform(".d2l-error")} { color: #ffa3ad !important; }
${platform(".d2l-success")} { color: #86e7ab !important; }
${platform(".d2l-warning")} { color: #fcd37a !important; }
`

const courseCardStyles = `
:host([data-cuny-plus-dark]) {
  background-color: #2c3442 !important;
  border-color: #56647a !important;
}
`
const courseCardMetadataStyles = `
d2l-card[data-cuny-plus-dark] :is(.d2l-body-small, .d2l-organization-date) {
  color: #b7c2d2 !important;
}
`

export function startBrightspaceTheme() {
  const stopHost = startHostTheme(brightspaceStyles)
  const cards = new Map<Element, HTMLStyleElement>()
  const metadata = new Map<ShadowRoot, HTMLStyleElement>()
  const observed = new WeakSet<ShadowRoot>()
  let active = true
  let scanTimer: number | undefined

  const apply = () => {
    for (const card of cards.keys())
      card.toggleAttribute("data-cuny-plus-dark", getTheme().dark)
  }

  const observer = new MutationObserver(() => {
    if (scanTimer !== undefined) return
    scanTimer = window.setTimeout(() => {
      scanTimer = undefined
      for (const card of cards.keys()) {
        if (!card.isConnected) {
          cards.get(card)?.remove()
          cards.delete(card)
        }
      }
      for (const tree of metadata.keys()) {
        if (!tree.host.isConnected) {
          metadata.get(tree)?.remove()
          metadata.delete(tree)
        }
      }
      scanCourseWidgets()
    }, 0)
  })

  const scan = (tree: ShadowRoot) => {
    if (!active) return
    if (!observed.has(tree)) {
      observer.observe(tree, { childList: true, subtree: true })
      observed.add(tree)
    }
    for (const element of tree.querySelectorAll("*")) {
      const shadow = element.shadowRoot
      if (!shadow) continue
      if (
        element.tagName === "D2L-CARD" &&
        tree.host?.tagName === "D2L-MY-COURSES-ENROLLMENT-CARD"
      ) {
        if (!metadata.has(tree) || !tree.contains(metadata.get(tree)!)) {
          metadata.get(tree)?.remove()
          const style = document.createElement("style")
          style.textContent = courseCardMetadataStyles
          tree.appendChild(style)
          metadata.set(tree, style)
        }
        if (!cards.has(element) || !shadow.contains(cards.get(element)!)) {
          cards.get(element)?.remove()
          const style = document.createElement("style")
          style.textContent = courseCardStyles
          shadow.appendChild(style)
          cards.set(element, style)
          element.toggleAttribute("data-cuny-plus-dark", getTheme().dark)
        }
      }
      scan(shadow)
    }
  }

  const scanCourseWidgets = () => {
    if (!active) return
    for (const widget of document.querySelectorAll("d2l-my-courses-v2"))
      if (widget.shadowRoot) scan(widget.shadowRoot)
  }

  const unsubscribe = subscribeTheme(apply)
  const rescan = () => scanCourseWidgets()
  observer.observe(document, { childList: true, subtree: true })
  document.addEventListener("DOMContentLoaded", rescan, { once: true })
  window.addEventListener("load", rescan, { once: true })
  scanCourseWidgets()
  return () => {
    active = false
    if (scanTimer !== undefined) window.clearTimeout(scanTimer)
    observer.disconnect()
    document.removeEventListener("DOMContentLoaded", rescan)
    window.removeEventListener("load", rescan)
    unsubscribe()
    for (const [card, style] of cards) {
      card.removeAttribute("data-cuny-plus-dark")
      style.remove()
    }
    for (const style of metadata.values()) style.remove()
    cards.clear()
    metadata.clear()
    stopHost()
  }
}
