import { useEffect, useState } from "react"

import "~style.css"

import iconData from "data-base64:~../assets/icon.png"

// Brand tokens matching the CUNY+ logo exactly
const NAVY = "#1B3A6B"
const NAVY_DARK = "#142D55"
const WHITE = "#FFFFFF"

function IndexPopup() {
  const [autoLogin, setAutoLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    chrome.storage.local.get(["autoLogin", "username", "password"], (data) => {
      if (data.autoLogin !== undefined) setAutoLogin(data.autoLogin)
      if (data.username) setUsername(data.username)
      if (data.password) setPassword(data.password)
    })
  }, [])

  const handleToggle = () => {
    const next = !autoLogin
    setAutoLogin(next)
    if (!next) {
      chrome.storage.local.set({ autoLogin: false, username: "", password: "" })
      setUsername("")
      setPassword("")
    }
  }

  const handleSave = () => {
    chrome.storage.local.set({ autoLogin, username, password }, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div style={{ width: 288, fontFamily: "'Segoe UI', system-ui, sans-serif", background: WHITE, color: "#1a1a2e" }}>
      {/* Header — matches logo: navy bg, white bold CUNY+ text */}
      <div style={{ background: NAVY, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Real logo icon */}
        <img 
          src={iconData} 
          alt="CUNY+ Logo"
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            flexShrink: 0,
            objectFit: "cover",
            backgroundColor: WHITE
          }} 
        />
        <div>
          <p style={{ margin: 0, color: WHITE, fontWeight: 700, fontSize: 14, letterSpacing: "0.02em" }}>CUNY Plus</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Auto Login row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Auto Login</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>Fills credentials on CUNY Login</p>
          </div>
          {/* Toggle switch — navy when on */}
          <button
            onClick={handleToggle}
            role="switch"
            aria-checked={autoLogin}
            style={{
              position: "relative",
              display: "inline-flex",
              height: 22,
              width: 40,
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              background: autoLogin ? NAVY : "#D1D5DB",
              transition: "background 0.2s"
            }}>
            <span style={{
              display: "inline-block",
              height: 16,
              width: 16,
              borderRadius: "50%",
              background: WHITE,
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              position: "absolute",
              top: 3,
              left: autoLogin ? 21 : 3,
              transition: "left 0.2s"
            }} />
          </button>
        </div>

        {/* Credentials form — only shown when toggle is ON */}
        {autoLogin && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Username */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 4 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="firstname.last##@login.cuny.edu"
                style={{
                  width: "100%",
                  fontSize: 11,
                  padding: "8px 10px",
                  border: "1.5px solid #D1D5DB",
                  borderRadius: 8,
                  outline: "none",
                  background: WHITE,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  color: "#1a1a2e"
                }}
                onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}22` }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none" }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 4 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{
                    width: "100%",
                    fontSize: 11,
                    padding: "8px 32px 8px 10px",
                    border: "1.5px solid #D1D5DB",
                    borderRadius: 8,
                    outline: "none",
                    background: WHITE,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    color: "#1a1a2e"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px ${NAVY}22` }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "#999"
                  }}>
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Save button — navy, matching logo */}
            <button
              onClick={handleSave}
              style={{
                width: "100%",
                padding: "9px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.03em",
                background: saved ? "#16A34A" : NAVY,
                color: WHITE,
                transition: "background 0.2s",
                fontFamily: "inherit"
              }}
              onMouseEnter={(e) => { if (!saved) (e.target as HTMLButtonElement).style.background = NAVY_DARK }}
              onMouseLeave={(e) => { if (!saved) (e.target as HTMLButtonElement).style.background = NAVY }}>
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        )}

        {/* RMP Status */}
        <div style={{ 
          paddingTop: 16, 
          borderTop: "1px solid #EEF2F8", 
          display: "flex", 
          alignItems: "center", 
          gap: 8 
        }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#16A34A" }}></span>
          <p style={{ margin: 0, fontSize: 11, color: "#4B5563", fontWeight: 500 }}>
            RMP integration is active
          </p>
        </div>
      </div>

      {/* Footer */}
      <p style={{ margin: 0, fontSize: 10, color: "#B0B8C4", textAlign: "center", paddingBottom: 12 }}>
        Stored locally on your device
      </p>
    </div>
  )
}

export default IndexPopup
