import type { RMPRatingPayload } from "../types"

// Function to handle the actual GraphQL request to RateMyProfessors
export async function fetchRMPRating(professorName: string): Promise<RMPRatingPayload> {
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
              ratings(first: 20) {
                edges {
                  node {
                    ratingTags
                  }
                }
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
    schoolName: matchedNode?.school?.name,
    tags: (() => {
      if (!matchedNode.ratings?.edges) return []
      const tagCounts: Record<string, number> = {}
      matchedNode.ratings.edges.forEach((edge: any) => {
        const rawTags = edge?.node?.ratingTags || ""
        if (rawTags) {
          rawTags.split("--").forEach((tag: string) => {
            // Normalize tag casing to match our emoji dictionary (e.g. "Tough grader" -> "Tough Grader")
            const cleanTag = tag.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            if (cleanTag) {
              tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1
            }
          })
        }
      })
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
    })()
  }
}
