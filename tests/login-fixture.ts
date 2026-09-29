import { vi } from "vitest"

export const credentials = {
  autoLogin: true,
  username: "test.user@login.cuny.edu",
  password: "synthetic-test-password",
  autoLoginRevision: "saved-revision-1"
}

export function connectLoginStorage(
  initial: Record<string, unknown> = credentials
) {
  let data = { ...initial }
  let readError: string | undefined
  let writeError = false
  const listeners = new Set<
    (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => void
  >()
  const runtime: { lastError?: { message: string } } = {}
  const get = vi.fn(
    (
      keys: string | string[],
      callback?: (value: Record<string, unknown>) => void
    ) => {
      const requested = typeof keys === "string" ? [keys] : keys
      const error = readError !== undefined && requested.includes(readError)
      if (error) readError = undefined
      const result = Object.fromEntries(
        requested.map((key) => [key, data[key]])
      )
      if (callback) {
        if (error) runtime.lastError = { message: "Synthetic read failure" }
        callback(error ? {} : result)
        delete runtime.lastError
        return
      }
      return error
        ? Promise.reject(new Error("Synthetic read failure"))
        : Promise.resolve(result)
    }
  )
  const change = (next: Record<string, unknown>) => {
    const changes: Record<string, chrome.storage.StorageChange> = {}
    for (const [key, newValue] of Object.entries(next)) {
      if (data[key] !== newValue)
        changes[key] = { oldValue: data[key], newValue }
    }
    data = { ...data, ...next }
    for (const listener of listeners) listener(changes, "local")
  }
  const set = vi.fn((next: Record<string, unknown>, callback?: () => void) => {
    const error = writeError
    writeError = false
    if (!error) change(next)
    if (callback) {
      if (error) runtime.lastError = { message: "Synthetic write failure" }
      callback()
      delete runtime.lastError
      return
    }
    return error
      ? Promise.reject(new Error("Synthetic write failure"))
      : Promise.resolve()
  })
  vi.stubGlobal("chrome", {
    runtime,
    storage: {
      local: { get, set },
      onChanged: {
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener)
      }
    }
  })
  return {
    get,
    set,
    change,
    failRead: (key = "autoLogin") => {
      readError = key
    },
    failWrite: () => {
      writeError = true
    }
  }
}
