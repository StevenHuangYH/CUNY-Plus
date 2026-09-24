import { afterEach, expect, it, vi } from "vitest"

import { fetchRMPRating } from "../src/features/ratings/api/rmp-api"
import { professor, searchResponse } from "./fixtures"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it.each(["Example University", "Unknown", "Hunter Academy"])(
  "requires selection even when both school labels equal an unrecognized campus: %s",
  async (campus) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            searchResponse([professor({ school: { name: campus } })])
          )
        )
    )
    expect(
      await fetchRMPRating({ professorName: "Alex Chen", campus })
    ).toMatchObject({ status: "candidates" })
  }
)

it("matches the course instructor and campus instead of the first CUNY candidate", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json(
        searchResponse([
          professor({
            id: "Teacher-2",
            legacyId: 2,
            lastName: "Chang",
            school: { id: "School-2", name: "Hunter College" }
          }),
          professor()
        ])
      )
    )
  )

  const result = await fetchRMPRating({
    professorName: "Dr. Alex Chen",
    campus: "Baruch College"
  })
  expect(result).toMatchObject({
    status: "matched",
    professor: {
      name: "Alex Chen",
      legacyId: "1",
      schoolName: "Baruch College"
    }
  })
})

it("distinguishes no candidates from failed or malformed searches", async () => {
  const input = { professorName: "Alex Chen", campus: "Baruch College" }
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(Response.json(searchResponse([])))
      .mockResolvedValueOnce(
        Response.json({ errors: [{ message: "Unavailable" }] })
      )
      .mockResolvedValueOnce(Response.json({ data: {} }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockRejectedValueOnce(new Error("Network disconnected"))
  )
  expect(await fetchRMPRating(input)).toEqual({ status: "empty" })
  for (let failure = 0; failure < 4; failure++) {
    expect(await fetchRMPRating(input)).toMatchObject({
      status: "error",
      error: expect.any(String)
    })
  }
})

it("ends a stalled search with a retryable failure", async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {}))
  )
  const pending = fetchRMPRating({ professorName: "Alex Chen" })
  await vi.advanceTimersByTimeAsync(10_000)
  expect(await pending).toMatchObject({
    status: "error",
    error: expect.stringMatching(/timed out/i)
  })
})

it("skips placeholders without contacting the remote search", async () => {
  const request = vi.fn().mockRejectedValue(new Error("Must not search"))
  vi.stubGlobal("fetch", request)
  for (const professorName of ["", "  Staff ", "TBA", "Dr. Unknown"]) {
    expect(await fetchRMPRating({ professorName })).toEqual({
      status: "skipped"
    })
  }
  expect(request).not.toHaveBeenCalled()
})

it("keeps missing scores unavailable while retaining a real zero percent", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json(
          searchResponse([professor({ avgRating: null, avgDifficulty: 0 })])
        )
      )
  )
  const result = await fetchRMPRating({
    professorName: "Alex Chen",
    campus: "Baruch College"
  })
  expect(result.status).toBe("matched")
  if (result.status === "matched") {
    expect(result.professor.avgRating).toBeUndefined()
    expect(result.professor.avgDifficulty).toBeUndefined()
    expect(result.professor.wouldTakeAgainPercent).toBe(0)
    expect(result.professor.tags).toEqual(["Tough Grader", "Helpful"])
  }
})

it.each([
  { professorName: "Alex Chen" },
  { professorName: "A. Chen", campus: "Baruch College" },
  { professorName: "Alex Chen", campus: "Hunter College" }
])(
  "requires a choice when the course identity is uncertain: %j",
  async (input) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(searchResponse([professor()])))
    )
    expect(await fetchRMPRating(input)).toMatchObject({
      status: "candidates",
      candidates: [{ name: "Alex Chen" }]
    })
  }
)

it("deduplicates one profile without merging distinct same-name profiles", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(searchResponse([professor(), professor()]))
      )
      .mockResolvedValueOnce(
        Response.json(
          searchResponse([
            professor(),
            professor({ id: "Teacher-2", legacyId: 2 })
          ])
        )
      )
  )
  const input = { professorName: "Alex Chen", campus: "Baruch College" }
  expect(await fetchRMPRating(input)).toMatchObject({
    status: "matched",
    professor: { legacyId: "1" }
  })
  const ambiguous = await fetchRMPRating(input)
  expect(ambiguous.status).toBe("candidates")
  if (ambiguous.status === "candidates")
    expect(ambiguous.candidates.map((p) => p.legacyId)).toEqual(["1", "2"])
})

it("does not treat identical initials as a confirmed full name", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json(searchResponse([professor({ firstName: "A." })]))
      )
  )
  expect(
    await fetchRMPRating({ professorName: "A. Chen", campus: "Baruch College" })
  ).toMatchObject({ status: "candidates" })
})

it("rejects incomplete candidate identities instead of silently ignoring a possible match", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json(
          searchResponse([
            professor(),
            professor({ id: "Teacher-2", legacyId: 2, school: null })
          ])
        )
      )
  )
  expect(
    await fetchRMPRating({
      professorName: "Alex Chen",
      campus: "Baruch College"
    })
  ).toMatchObject({ status: "error" })
})
