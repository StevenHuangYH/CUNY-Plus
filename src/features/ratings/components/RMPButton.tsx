import type { PlasmoCSUIProps } from "plasmo"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import type { RMPRating } from "../types"

// Brand tokens — identical to popup.tsx and logo
const NAVY = "#1B3A6B"
const NAVY_DARK = "#142D55"
const NAVY_LIGHT = "#EEF2F8"

const CUNYPlusButton = ({ anchor }: PlasmoCSUIProps) => {
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState<RMPRating | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [cardPos, setCardPos] = useState<{ 
    top?: number | string; 
    bottom?: number | string; 
    left?: number | string; 
    right?: number | string;
    marginTop?: number | string;
    marginBottom?: number | string;
  }>({ top: '100%', left: 0, marginTop: 8 })

  // Lower the z-index of Plasmo's injected shadow host so the portaled card appears above all buttons
  useEffect(() => {
    if (containerRef.current) {
      const rootNode = containerRef.current.getRootNode() as ShadowRoot
      if (rootNode && rootNode.host) {
        ;(rootNode.host as HTMLElement).style.setProperty("z-index", "9999", "important")
      }
    }
  }, [])

  // Adjust position when card is opened to avoid window clipping
  useEffect(() => {
    if (!showCard) return

    const adjustPosition = () => {
      if (cardRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        // Use getBoundingClientRect for the card, but it might initially be unpositioned or overflowing.
        const cardRect = cardRef.current.getBoundingClientRect()
        
        const pos: any = { marginTop: 8 }
        
        // Horizontal positioning
        if (containerRect.left + cardRect.width > window.innerWidth - 20) {
          pos.left = Math.max(10, containerRect.right - cardRect.width)
        } else {
          pos.left = containerRect.left
        }
        
        // Vertical positioning
        if (containerRect.bottom + cardRect.height + 10 > window.innerHeight && containerRect.top - cardRect.height - 10 > 0) {
          // Render above the button if there isn't enough space below, and there is space above
          pos.top = containerRect.top - cardRect.height - 8
          pos.marginTop = 0
        } else {
          // Render below the button
          pos.top = containerRect.bottom
          pos.marginTop = 8
        }
        
        setCardPos(pos)
      }
    }

    adjustPosition()

    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the card itself
      const path = e.composedPath ? e.composedPath() : []
      if (cardRef.current && path.includes(cardRef.current)) return
      
      setShowCard(false) // Close on scroll to avoid detached fixed element
    }

    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath ? e.composedPath() : []
      const isInsideCard = cardRef.current && path.includes(cardRef.current)
      const isInsideContainer = containerRef.current && path.includes(containerRef.current)
      
      if (!isInsideCard && !isInsideContainer) {
        setShowCard(false)
      }
    }

    // Use capture phase to catch scroll events on any internal scrolling container
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('click', handleClickOutside, true)
    window.addEventListener('resize', adjustPosition)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('click', handleClickOutside, true)
      window.removeEventListener('resize', adjustPosition)
    }
  }, [showCard, rating, error])

  // Extract and clean professor name from the anchor element
  const getProfessorName = () => {
    const rawName = anchor?.element?.textContent || ""
    return rawName
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/^(Prof\.|Professor|Dr\.)\s+/i, "") // Strip titles
      .trim()
  }

  const name = getProfessorName()

  // Gracefully skip rendering buttons for empty, Staff, or TBA slots
  const isInvalidName = !name || /^(staff|tba|to be announced|tbd|unknown)$/i.test(name)
  if (isInvalidName) {
    return null
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (showCard) {
      setShowCard(false)
      return
    }

    setLoading(true)
    setError(null)

    // Message background script to fetch ratings
    chrome.runtime.sendMessage(
      {
        type: "FETCH_PROFESSOR_RATING",
        payload: { professorName: name }
      },
      (response) => {
        setLoading(false)
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message || "Failed to communicate with background service")
          setShowCard(true)
          return
        }

        if (response && response.success) {
          setRating(response)
          setError(null)
        } else {
          setError(response?.error || "Professor not found or no ratings available")
          setRating(null)
        }
        setShowCard(true)
      }
    )
  }

  // Score → color mapping, consistent with CUNY Plus palette
  const getRatingColor = (score?: number) => {
    if (score === undefined) return "#94A3B8"
    if (score >= 4.0) return "#16A34A"
    if (score >= 3.0) return "#D97706"
    return "#DC2626"
  }

  const getRatingBg = (score?: number) => {
    if (score === undefined) return "#F8FAFC"
    if (score >= 4.0) return "#F0FDF4"
    if (score >= 3.0) return "#FFFBEB"
    return "#FFF1F2"
  }

  const getDifficultyColor = (d?: number) => {
    if (d === undefined) return "#94A3B8"
    if (d <= 2.5) return "#16A34A"
    if (d <= 3.5) return "#D97706"
    return "#DC2626"
  }

  return (
    <div ref={containerRef} style={{ display: "inline-block", position: "relative", marginLeft: 8, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Trigger button — navy pill, matches logo */}
      <button
        onClick={handleButtonClick}
        disabled={loading}
        title={`View RateMyProfessors ratings for ${name}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.02em",
          borderRadius: 20,
          border: `1.5px solid ${NAVY}`,
          background: loading ? NAVY_LIGHT : NAVY,
          color: loading ? NAVY : "#FFFFFF",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.15s ease",
          userSelect: "none",
          fontFamily: "inherit"
        }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = NAVY_DARK }}
        onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = NAVY }}>
        {loading ? (
          <>
            <svg style={{ animation: "spin 1s linear infinite", width: 12, height: 12 }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke={NAVY} strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill={NAVY} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span style={{ color: NAVY }}>Loading…</span>
          </>
        ) : (
          <>
            {/* Mini CUNY+ badge on the button */}
            <span style={{
              background: "#FFFFFF",
              color: NAVY,
              borderRadius: 4,
              fontSize: 9,
              fontWeight: 800,
              padding: "2px 4px",
              lineHeight: 1,
              letterSpacing: "0.03em"
            }}>C+</span>
            RMP
          </>
        )}
      </button>

      {/* RMP Rating Card */}
      {showCard && document.body && createPortal(
        <div 
          ref={cardRef}
          style={{
            position: "fixed",
            zIndex: 2147483647,
            top: cardPos.top,
            left: cardPos.left,
            ...(cardPos.marginTop !== undefined ? { marginTop: cardPos.marginTop } : {}),
            width: "max-content",
            minWidth: 240,
            maxWidth: 280,
            background: "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 10px 40px -10px rgba(27,58,107,0.25), 0 4px 12px -4px rgba(0,0,0,0.1)",
            border: `1px solid ${NAVY_LIGHT}`,
            overflow: "hidden",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            display: "flex",
            flexDirection: "column",
            animation: "popIn 0.15s ease-out",
            transformOrigin: "center"
          }}>
          {/* Internal fade-in style for smoother appearance */}
          <style>
            {`
              @keyframes popIn {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
              }
            `}
          </style>

          {/* Card header — same navy as logo */}
          <div style={{ background: NAVY, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: "#FFFFFF", fontWeight: 700, fontSize: 14, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
              <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {rating?.schoolName || "RateMyProfessors"}
              </p>
            </div>
            {/* Close button */}
            <button
              onClick={() => setShowCard(false)}
              style={{
                border: "none",
                background: "rgba(255,255,255,0.15)",
                borderRadius: 6,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FFFFFF",
                flexShrink: 0,
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)" }}
              >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Card body */}
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {error ? (
              <div style={{ fontSize: 12, color: "#DC2626", background: "#FFF1F2", borderRadius: 8, padding: "12px", lineHeight: 1.5, border: "1px solid #FECDD3" }}>
                ⚠️ {error}
              </div>
            ) : rating ? (
              <>
                {/* Overall Rating */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: getRatingBg(rating.avgRating),
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: `1px solid ${getRatingColor(rating.avgRating)}33`
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Overall Quality</span>
                    {rating.avgRating !== undefined && (
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        color: getRatingColor(rating.avgRating),
                        background: `${getRatingColor(rating.avgRating)}1A`,
                        padding: "2px 6px",
                        borderRadius: 4,
                        width: "fit-content",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        {rating.avgRating >= 4.0 ? "Awesome" : rating.avgRating >= 3.0 ? "Average" : "Awful"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: getRatingColor(rating.avgRating) }}>
                      {rating.avgRating ? rating.avgRating.toFixed(1) : "N/A"}
                    </span>
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>/ 5.0</span>
                  </div>
                </div>

                {/* Two-column stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: NAVY_LIGHT, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#4B5563", fontWeight: 600, marginBottom: 2 }}>Difficulty</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: getDifficultyColor(rating.avgDifficulty) }}>
                      {rating.avgDifficulty ? `${rating.avgDifficulty.toFixed(1)} / 5` : "N/A"}
                    </p>
                  </div>
                  <div style={{ background: NAVY_LIGHT, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#4B5563", fontWeight: 600, marginBottom: 2 }}>Would Take Again</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>
                      {rating.wouldTakeAgainPercent !== undefined && rating.wouldTakeAgainPercent !== -1
                        ? `${Math.round(rating.wouldTakeAgainPercent)}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {rating.tags && rating.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                    {rating.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} style={{ 
                        background: "#F3F4F6", 
                        color: "#4B5563", 
                        padding: "2px 8px", 
                        borderRadius: 12, 
                        fontSize: 10, 
                        fontWeight: 600,
                        border: "1px solid #E5E7EB"
                      }}>
                        {tag}
                      </span>
                    ))}
                    {rating.tags.length > 3 && (
                      <span style={{ fontSize: 10, color: "#9CA3AF", padding: "2px 4px", fontWeight: 600 }}>
                        +{rating.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                  <span style={{ fontWeight: 500 }}>Based on {rating.numRatings || 0} reviews</span>
                  {rating.legacyId && (
                    <a
                      href={`https://www.ratemyprofessors.com/professor/${rating.legacyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: NAVY, 
                        fontWeight: 600, 
                        textDecoration: "none", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 4,
                        padding: "4px 6px",
                        background: NAVY_LIGHT,
                        borderRadius: 6,
                        transition: "background 0.2s ease"
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#D6E0F0" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = NAVY_LIGHT }}
                      >
                      Full Profile
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default CUNYPlusButton

