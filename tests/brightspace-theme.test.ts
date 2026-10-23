// @vitest-environment jsdom
import { waitFor } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"

import {
  brightspaceStyles,
  startBrightspaceTheme
} from "../src/features/theme/brightspace"
import { startHostTheme } from "../src/features/theme/host-page"
import { connectLoginStorage } from "./login-fixture"

let stop: (() => void) | undefined
let site: HTMLStyleElement | undefined
afterEach(() => {
  stop?.()
  stop = undefined
  site?.remove()
  site = undefined
  document.body.innerHTML = ""
})

it("updates an open Brightspace course list and restores the site's latest theme", async () => {
  const storage = connectLoginStorage()
  site = document.createElement("style")
  site.textContent = `html { --d2l-theme-background-color-base: #fff; --d2l-theme-text-color-static-standard: #202122; --d2l-theme-status-color-error: #cd2026; }
    body { background: #f6f7f8; color: #202122; }
    .d2l-navigation-s, .d2l-widget { background: white; color: #202122; }
    .d2l-branding-navigation-background-color { background: #0033a1; }
    .d2l-course-status { background: #b9ddfb; color: #161513; }`
  document.head.appendChild(site)
  document.body.innerHTML = `<nav class="d2l-navigation-s"><img src="logo.png" alt="College"></nav>
    <d2l-labs-navigation-main-footer class="d2l-branding-navigation-background-color"></d2l-labs-navigation-main-footer>
    <main><div class="d2l-widget"><a href="#course">My Courses</a><span class="d2l-course-status">Open</span></div></main>
    <iframe src="https://tool.example/embed"></iframe>`
  stop = startHostTheme(brightspaceStyles)
  await storage.change({ darkMode: true })
  expect(getComputedStyle(document.body).backgroundColor).toBe(
    "rgb(32, 36, 44)"
  )
  expect(
    getComputedStyle(document.querySelector(".d2l-widget")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--d2l-theme-background-color-base")
      .trim()
  ).toBe("#2c3442")
  expect(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--d2l-theme-status-color-error")
      .trim()
  ).toBe("#cd2026")
  expect(
    getComputedStyle(
      document.querySelector(".d2l-branding-navigation-background-color")!
    ).backgroundColor
  ).toBe("rgb(0, 51, 161)")
  expect(
    getComputedStyle(document.querySelector(".d2l-course-status")!)
      .backgroundColor
  ).toBe("rgb(185, 221, 251)")
  expect(document.querySelector("img")!.getAttribute("src")).toBe("logo.png")
  expect(getComputedStyle(document.querySelector("img")!).filter).not.toMatch(
    /invert/
  )
  expect(document.querySelector("iframe")!.getAttribute("src")).toBe(
    "https://tool.example/embed"
  )
  site.textContent += `html { --d2l-theme-background-color-base: #efe9db; } .d2l-widget { background: #efe9db; }`
  expect(document.documentElement.hasAttribute("data-cuny-plus-dark")).toBe(
    true
  )
  await storage.change({ darkMode: false })
  expect(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--d2l-theme-background-color-base")
      .trim()
  ).toBe("#efe9db")
  expect(
    getComputedStyle(document.querySelector(".d2l-widget")!).backgroundColor
  ).toBe("rgb(239, 233, 219)")
})

it("uses the saved choice on assignment and quiz views with readable controls and statuses", async () => {
  connectLoginStorage({ darkMode: true })
  site = document.createElement("style")
  site.textContent = `body { background: white; color: #202122; }
    .d2l-page-main, .d2l-dialog, .d2l-table { background: white; color: #202122; }
    .d2l-button { background: #e3e9f1; color: #202122; }
    input, textarea { background: white; color: #202122; }
    .d2l-error { color: #cd2026; }
    .d2l-success { color: #027a21; }
    .d2l-course-banner { background: #f9fbff url(course.png); }
    .course-state { background: #b9ddfb; color: #161513; }`
  document.head.appendChild(site)
  stop = startHostTheme(brightspaceStyles)
  document.body.innerHTML = `<main class="d2l-page-main"><h1 class="d2l-heading-title">Assignments</h1>
    <div class="d2l-course-banner">Course</div><table class="d2l-table"><tr><th>Quiz</th><td><a href="#quiz">Open quiz</a></td></tr></table>
    <button class="d2l-button">View History</button><div class="d2l-dialog" role="dialog"><label for="answer">Answer</label><textarea id="answer"></textarea></div>
    <p class="d2l-error">Could not submit</p><p class="d2l-success">Saved</p><span class="course-state">Available</span></main>`
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(getComputedStyle(document.body).backgroundColor).toBe(
    "rgb(32, 36, 44)"
  )
  expect(
    getComputedStyle(document.querySelector(".d2l-page-main")!).color
  ).toBe("rgb(241, 245, 249)")
  expect(
    getComputedStyle(document.querySelector(".d2l-table")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector(".d2l-dialog")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector("textarea")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(
    getComputedStyle(document.querySelector(".d2l-button")!).backgroundColor
  ).toBe("rgb(57, 73, 96)")
  expect(getComputedStyle(document.querySelector(".d2l-error")!).color).toBe(
    "rgb(255, 163, 173)"
  )
  expect(getComputedStyle(document.querySelector(".d2l-success")!).color).toBe(
    "rgb(134, 231, 171)"
  )
  expect(
    getComputedStyle(document.querySelector(".course-state")!).backgroundColor
  ).toBe("rgb(185, 221, 251)")
  expect(
    getComputedStyle(document.querySelector(".d2l-course-banner")!)
      .backgroundImage
  ).toBe('url("course.png")')
  expect(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--d2l-theme-background-color-floating")
      .trim()
  ).toBe("#323b4b")
  expect(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--d2l-theme-text-color-interactive-default")
      .trim()
  ).toBe("#a6c8ff")
})

it("updates course cards created inside Brightspace shadow roots and restores them", async () => {
  const storage = connectLoginStorage()
  stop = startBrightspaceTheme()
  const widget = document.createElement("d2l-my-courses-v2")
  const widgetRoot = widget.attachShadow({ mode: "open" })
  const enrollment = document.createElement("d2l-my-courses-enrollment-card")
  const enrollmentRoot = enrollment.attachShadow({ mode: "open" })
  widgetRoot.appendChild(enrollment)
  document.body.appendChild(widget)
  const makeCard = () => {
    const card = document.createElement("d2l-card")
    card.attachShadow({ mode: "open" }).innerHTML = `<div>Course</div>`
    enrollmentRoot.appendChild(card)
    return card
  }
  const first = makeCard()
  await storage.change({ darkMode: true })
  await waitFor(() =>
    expect(first.hasAttribute("data-cuny-plus-dark")).toBe(true)
  )
  expect(first.shadowRoot!.querySelector("style")!.textContent).toContain(
    "background-color: #2c3442"
  )
  expect(enrollmentRoot.querySelector("style")!.textContent).toContain(
    ".d2l-organization-date"
  )
  const second = makeCard()
  await waitFor(() =>
    expect(second.hasAttribute("data-cuny-plus-dark")).toBe(true)
  )
  await storage.change({ darkMode: false })
  expect(first.hasAttribute("data-cuny-plus-dark")).toBe(false)
  expect(second.hasAttribute("data-cuny-plus-dark")).toBe(false)
})
