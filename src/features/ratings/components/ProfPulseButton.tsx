import type { PlasmoCSUIProps } from "plasmo"
import { useState } from "react"
import type { RMPRating } from "../types"

const ProfPulseButton = ({ anchor }: PlasmoCSUIProps) => {
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState<RMPRating | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Get dynamic colors based on rating score
  const getRatingColorClass = (score?: number) => {
    if (score === undefined) return "plasmo-text-slate-500"
    if (score >= 4.0) return "plasmo-text-emerald-600 plasmo-font-bold"
    if (score >= 3.0) return "plasmo-text-amber-500 plasmo-font-bold"
    return "plasmo-text-rose-600 plasmo-font-bold"
  }

  const getRatingBgColorClass = (score?: number) => {
    if (score === undefined) return "plasmo-bg-slate-100"
    if (score >= 4.0) return "plasmo-bg-emerald-50"
    if (score >= 3.0) return "plasmo-bg-amber-50"
    return "plasmo-bg-rose-50"
  }

  const getDifficultyColorClass = (difficulty?: number) => {
    if (difficulty === undefined) return "plasmo-text-slate-500"
    if (difficulty <= 2.5) return "plasmo-text-emerald-600"
    if (difficulty <= 3.5) return "plasmo-text-amber-500"
    return "plasmo-text-rose-600"
  }

  return (
    <div className="plasmo-inline-block plasmo-relative plasmo-ml-2">
      {/* View Rating Trigger Button */}
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className="plasmo-inline-flex plasmo-items-center plasmo-px-2.5 plasmo-py-1 plasmo-text-xs plasmo-font-semibold plasmo-rounded-full plasmo-border plasmo-border-indigo-100 plasmo-bg-indigo-50 hover:plasmo-bg-indigo-100 plasmo-text-indigo-700 plasmo-transition-all plasmo-duration-200 active:plasmo-scale-95 disabled:plasmo-opacity-70 plasmo-cursor-pointer plasmo-select-none"
        title={`View RateMyProfessors ratings for ${name}`}>
        {loading ? (
          <span className="plasmo-flex plasmo-items-center">
            <svg className="plasmo-animate-spin plasmo-h-3.5 plasmo-w-3.5 plasmo-mr-1.5" fill="none" viewBox="0 0 24 24">
              <circle className="plasmo-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="plasmo-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Fetching...
          </span>
        ) : (
          <span>📊 View Rating</span>
        )}
      </button>

      {/* Sleek Rating Hover Card / Modal */}
      {showCard && (
        <div className="plasmo-absolute plasmo-z-50 plasmo-top-7 plasmo-left-0 plasmo-w-72 plasmo-bg-white plasmo-shadow-2xl plasmo-rounded-2xl plasmo-border plasmo-border-slate-100 plasmo-p-4 plasmo-animate-in plasmo-fade-in plasmo-slide-in-from-top-2 plasmo-duration-200">
          <div className="plasmo-flex plasmo-justify-between plasmo-items-start plasmo-mb-3">
            <div>
              <h3 className="plasmo-text-sm plasmo-font-bold plasmo-text-slate-800 plasmo-leading-snug">{name}</h3>
              {rating?.schoolName ? (
                <p className="plasmo-text-[10px] plasmo-text-slate-400 plasmo-truncate plasmo-max-w-[210px]">{rating.schoolName}</p>
              ) : (
                <p className="plasmo-text-[10px] plasmo-text-slate-400">Rate My Professors Info</p>
              )}
            </div>
            <button
              onClick={() => setShowCard(false)}
              className="plasmo-text-slate-400 hover:plasmo-text-slate-600 plasmo-p-1 plasmo-rounded-full hover:plasmo-bg-slate-50 plasmo-transition-colors plasmo-border-none plasmo-bg-transparent plasmo-cursor-pointer">
              <svg className="plasmo-w-4 plasmo-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error ? (
            <div className="plasmo-text-xs plasmo-text-rose-500 plasmo-bg-rose-50 plasmo-p-3 plasmo-rounded-xl">
              ⚠️ {error}
            </div>
          ) : rating ? (
            <div className="plasmo-space-y-3.5">
              {/* Overall Rating Display */}
              <div className={`plasmo-flex plasmo-items-center plasmo-justify-between plasmo-p-3 plasmo-rounded-xl ${getRatingBgColorClass(rating.avgRating)}`}>
                <span className="plasmo-text-xs plasmo-font-medium plasmo-text-slate-600">Overall Quality</span>
                <div className="plasmo-flex plasmo-items-baseline">
                  <span className={`plasmo-text-xl ${getRatingColorClass(rating.avgRating)}`}>
                    {rating.avgRating ? rating.avgRating.toFixed(1) : "N/A"}
                  </span>
                  <span className="plasmo-text-[10px] plasmo-text-slate-400 plasmo-ml-0.5">/ 5.0</span>
                </div>
              </div>

              {/* Two Column Stats: Difficulty & Would Take Again */}
              <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-2.5">
                <div className="plasmo-bg-slate-50 plasmo-p-2.5 plasmo-rounded-xl">
                  <p className="plasmo-text-[10px] plasmo-text-slate-400 plasmo-mb-0.5">Difficulty</p>
                  <p className={`plasmo-text-sm plasmo-font-bold ${getDifficultyColorClass(rating.avgDifficulty)}`}>
                    {rating.avgDifficulty ? `${rating.avgDifficulty.toFixed(1)} / 5.0` : "N/A"}
                  </p>
                </div>
                <div className="plasmo-bg-slate-50 plasmo-p-2.5 plasmo-rounded-xl">
                  <p className="plasmo-text-[10px] plasmo-text-slate-400 plasmo-mb-0.5">Would Take Again</p>
                  <p className="plasmo-text-sm plasmo-font-bold plasmo-text-slate-700">
                    {rating.wouldTakeAgainPercent !== undefined && rating.wouldTakeAgainPercent !== -1
                      ? `${Math.round(rating.wouldTakeAgainPercent)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-text-[10px] plasmo-text-slate-400 plasmo-px-1">
                <span>Based on {rating.numRatings || 0} reviews</span>
                {rating.legacyId && (
                  <a
                    href={`https://www.ratemyprofessors.com/professor/${rating.legacyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plasmo-text-indigo-600 hover:plasmo-underline plasmo-font-semibold plasmo-flex plasmo-items-center">
                    Full Profile
                    <svg className="plasmo-w-3 plasmo-h-3 plasmo-ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default ProfPulseButton
