type ThemeState = { dark: boolean; ready: boolean; error: string }

const initial: ThemeState = { dark: false, ready: false, error: "" }
let state = initial
let revision = 0
let disconnect: (() => void) | undefined
const listeners = new Set<() => void>()

export const getTheme = () => state

function publish(next: ThemeState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    const storage = globalThis.chrome?.storage
    if (storage) {
      const onChanged = (
        changes: Record<string, chrome.storage.StorageChange>,
        area: string
      ) => {
        if (area !== "local" || !("darkMode" in changes)) return
        revision++
        publish({
          dark: changes.darkMode.newValue === true,
          ready: true,
          error: ""
        })
      }
      storage.onChanged.addListener(onChanged)
      disconnect = () => storage.onChanged.removeListener(onChanged)
      const request = ++revision
      void storage.local.get("darkMode").then(
        (data) => {
          if (request === revision)
            publish({ dark: data.darkMode === true, ready: true, error: "" })
        },
        () => {
          if (request === revision)
            publish({
              ...initial,
              ready: true,
              error: "Could not load appearance. Try Dark mode again."
            })
        }
      )
    } else {
      publish({ ...initial, ready: true })
    }
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      disconnect?.()
      disconnect = undefined
      revision++
      state = initial
    }
  }
}

export async function setDarkMode(dark: boolean) {
  const request = revision
  await chrome.storage.local.set({ darkMode: dark })
  // An unchanged stored value may not emit onChanged (for example after a
  // failed initial read). Confirm it locally unless a newer event arrived.
  if (request === revision) {
    revision++
    publish({ dark, ready: true, error: "" })
  }
}
