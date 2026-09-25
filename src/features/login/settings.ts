export interface LoginSettings {
  autoLogin: boolean
  username: string
  password: string
  autoLoginRevision: string
}

export const LOGIN_SETTING_KEYS = [
  "autoLogin",
  "username",
  "password",
  "autoLoginRevision"
]

export async function readLoginSettings(): Promise<LoginSettings> {
  const data = await chrome.storage.local.get(LOGIN_SETTING_KEYS)
  return {
    autoLogin: data.autoLogin === true,
    username: typeof data.username === "string" ? data.username : "",
    password: typeof data.password === "string" ? data.password : "",
    autoLoginRevision:
      typeof data.autoLoginRevision === "string" ? data.autoLoginRevision : ""
  }
}

export async function saveLoginSettings(
  input: Omit<LoginSettings, "autoLoginRevision">
): Promise<LoginSettings> {
  const settings = {
    autoLogin: input.autoLogin,
    username: input.autoLogin ? input.username.trim() : "",
    password: input.autoLogin ? input.password : "",
    autoLoginRevision: crypto.randomUUID()
  }
  await chrome.storage.local.set(settings)
  return settings
}
