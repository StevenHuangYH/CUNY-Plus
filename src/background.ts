import { fetchRMPRating } from "~features/ratings/api/rmp-api"

// Listen for messages from the Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "FETCH_PROFESSOR_RATING") {
    const payload = message.payload
    if (
      !payload ||
      typeof payload.professorName !== "string" ||
      (payload.campus !== undefined && typeof payload.campus !== "string")
    ) {
      sendResponse({
        status: "error",
        error: "The course information is invalid. Please reload the page."
      })
      return false
    }

    // Perform a global search (without locking to a single school ID)
    // so it works across all CUNY campuses (Baruch, CCNY, Hunter, Brooklyn, etc.)
    fetchRMPRating({
      professorName: payload.professorName,
      campus: payload.campus
    })
      .then((data) => {
        sendResponse(data)
      })
      .catch((err) => {
        console.error("Error fetching rating in background:", err)
        sendResponse({
          status: "error",
          error: "The professor search failed. Please retry."
        })
      })

    // Return true to indicate we will respond asynchronously
    return true
  }
})
