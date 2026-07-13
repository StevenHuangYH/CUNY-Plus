import { fetchRMPRating } from "~features/ratings/api/rmp-api"

// Listen for messages from the Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_PROFESSOR_RATING") {
    const { professorName } = message.payload

    // Perform a global search (without locking to a single school ID)
    // so it works across all CUNY campuses (Baruch, CCNY, Hunter, Brooklyn, etc.)
    fetchRMPRating(professorName)
      .then((data) => {
        sendResponse(data)
      })
      .catch((err) => {
        console.error("Error fetching rating in background:", err)
        sendResponse({ success: false, error: err.message })
      })

    // Return true to indicate we will respond asynchronously
    return true
  }
})
