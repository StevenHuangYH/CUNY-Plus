// Interface for the payload we send back to the Content Script
interface RMPRatingPayload {
  success: boolean
  avgRating?: number
  avgDifficulty?: number
  wouldTakeAgainPercent?: number
  numRatings?: number
  legacyId?: string
  id?: string
  schoolName?: string
  error?: string
}

// Listen for messages from the Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_PROFESSOR_RATING") {
    const { professorName } = message.payload

    // Perform a global search (without locking to a single school ID)
    // so it works across all CUNY campuses (Baruch, CCNY, Hunter, Brooklyn, Queens, etc.)
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

// Function to handle the actual GraphQL request
async function fetchRMPRating(professorName: string): Promise<RMPRatingPayload> {
  const query = `
    query NewSearchTeachersQuery($text: String!) {
      newSearch {
        teachers(query: {text: $text}) {
          edges {
            node {
              id
              legacyId
              firstName
              lastName
              avgRating
              avgDifficulty
              wouldTakeAgainPercent
              numRatings
              school {
                name
                id
              }
            }
          }
        }
      }
    }
  `

  const variables = {
    text: professorName
  }

  const response = await fetch("https://www.ratemyprofessors.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic dGVzdDp0ZXN0" // Standard public token used by RMP web app
    },
    body: JSON.stringify({
      query,
      variables
    })
  })

  if (!response.ok) {
    throw new Error(`RMP API request failed with status: ${response.status}`)
  }

  const json = await response.json()
  const edges = json?.data?.newSearch?.teachers?.edges

  if (!edges || edges.length === 0) {
    throw new Error("Professor not found")
  }

  // Filter edges to find CUNY schools if possible, or just default to the first match
  let matchedNode = edges[0].node
  const cunyNode = edges.find((edge: any) => {
    const schoolName = edge?.node?.school?.name?.toLowerCase() || ""
    return schoolName.includes("cuny") || 
           schoolName.includes("city university of new york") || 
           schoolName.includes("baruch") || 
           schoolName.includes("hunter") || 
           schoolName.includes("ccny") || 
           schoolName.includes("brooklyn college") || 
           schoolName.includes("queens college")
  })

  if (cunyNode) {
    matchedNode = cunyNode.node
  }

  return {
    success: true,
    avgRating: matchedNode.avgRating,
    avgDifficulty: matchedNode.avgDifficulty,
    wouldTakeAgainPercent: matchedNode.wouldTakeAgainPercent,
    numRatings: matchedNode.numRatings,
    legacyId: matchedNode.legacyId,
    id: matchedNode.id,
    schoolName: matchedNode?.school?.name
  }
}
