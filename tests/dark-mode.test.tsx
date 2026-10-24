// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"

import RMPButton from "../src/features/ratings/components/RMPButton"
import { cunyfirstHomeStyles } from "../src/features/theme/cunyfirst-home"
import { startHostTheme } from "../src/features/theme/host-page"
import IndexPopup from "../src/popup"
import { connectLoginStorage, credentials } from "./login-fixture"

let stopHost: (() => void) | undefined
let portalStyle: HTMLStyleElement | undefined
afterEach(() => {
  cleanup()
  stopHost?.()
  stopHost = undefined
  portalStyle?.remove()
  portalStyle = undefined
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

it("starts light, remembers the button choice, and keeps login settings independent", async () => {
  const storage = connectLoginStorage(credentials)
  const user = userEvent.setup()
  const first = render(<IndexPopup />)
  const button = await screen.findByRole("button", { name: "Dark mode" })
  await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false))
  expect(button.getAttribute("aria-pressed")).toBe("false")
  await user.click(button)
  expect(button.getAttribute("aria-pressed")).toBe("true")
  expect(storage.set).toHaveBeenCalledExactlyOnceWith({ darkMode: true })
  expect(screen.getByDisplayValue(credentials.username)).toBeTruthy()
  first.unmount()
  render(<IndexPopup />)
  await waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Dark mode" })
        .getAttribute("aria-pressed")
    ).toBe("true")
  )
  await user.click(screen.getByRole("button", { name: "Dark mode" }))
  expect(storage.set).toHaveBeenLastCalledWith({ darkMode: false })
  expect(
    screen
      .getByRole("button", { name: "Dark mode" })
      .getAttribute("aria-pressed")
  ).toBe("false")
})

it("retains the saved appearance on a failed write and allows retry", async () => {
  const storage = connectLoginStorage({ darkMode: true })
  const user = userEvent.setup()
  render(<IndexPopup />)
  const button = screen.getByRole("button", { name: "Dark mode" })
  await waitFor(() => expect(button.getAttribute("aria-pressed")).toBe("true"))
  storage.failWrite()
  await user.click(button)
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not save appearance/i
  )
  expect(button.getAttribute("aria-pressed")).toBe("true")
  await user.click(button)
  expect(button.getAttribute("aria-pressed")).toBe("false")
  expect(screen.queryByRole("alert")).toBeNull()
})

it("reports a failed appearance read without blocking login settings", async () => {
  const storage = connectLoginStorage({ ...credentials, darkMode: true })
  storage.failRead("darkMode")
  render(<IndexPopup />)
  expect((await screen.findByRole("alert")).textContent).toMatch(
    /could not load appearance/i
  )
  expect(screen.getByDisplayValue(credentials.username)).toBeTruthy()
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Dark mode" }))
  expect(screen.queryByRole("alert")).toBeNull()
})

it("updates open host pages and new page content, preserving images and calendar colors, then restores light", async () => {
  const storage = connectLoginStorage()
  // Representative original rules from the public Schedule Builder and SSO CSS.
  portalStyle = document.createElement("style")
  portalStyle.textContent = `body { background-color: #fff; color: #000; }
    .bottomAdvice, .enrollmentEncouragement, .tipbox { background-color: #fff; }
    .faculty, .campus { color: #444; }
    .row.two { background-color: #f8fafb; }
    label { color: #0c2255; }
    .form-control { background-color: #fff; }
    a { color: #000e90; }`
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `<div class="row two"><label>Username</label><input class="form-control" aria-label="Username"></div><div class="bc1" style="background-color: rgb(165, 214, 167)"><span class="faculty">Course</span></div><img alt="CUNY logo" src="logo.png"><div data-cuny-plus-ui><a href="#">Profile</a></div><div class="bottomAdvice"><span class="faculty">Instructor</span></div><div class="enrollmentEncouragement">Enroll</div><div class="tipbox"><span class="campus">Campus</span></div>`
  const originalBody = getComputedStyle(document.body).backgroundColor
  const originalBlock = getComputedStyle(
    document.querySelector(".bc1")!
  ).backgroundColor
  stopHost = startHostTheme()
  await act(async () => storage.change({ darkMode: true }))
  expect(getComputedStyle(document.body).backgroundColor).toBe(
    "rgb(32, 36, 44)"
  )
  expect(
    getComputedStyle(document.querySelector("input")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(
    getComputedStyle(document.querySelector(".bc1")!).backgroundColor
  ).toBe(originalBlock)
  expect(document.querySelector("img")!.getAttribute("src")).toBe("logo.png")
  expect(getComputedStyle(document.querySelector("img")!).filter).not.toMatch(
    /invert/
  )
  for (const panel of document.querySelectorAll(
    ".bottomAdvice, .enrollmentEncouragement, .tipbox"
  )) {
    expect(getComputedStyle(panel).backgroundColor).toBe("rgb(44, 52, 66)")
    expect(getComputedStyle(panel).color).toBe("rgb(241, 245, 249)")
  }
  expect(
    getComputedStyle(document.querySelector(".bottomAdvice .faculty")!).color
  ).toBe("rgb(219, 228, 240)")
  expect(getComputedStyle(document.querySelector(".bc1 .faculty")!).color).toBe(
    "rgb(26, 26, 46)"
  )
  expect(
    getComputedStyle(document.querySelector("[data-cuny-plus-ui] a")!).color
  ).toBe("rgb(0, 14, 144)")
  const panel = document.createElement("div")
  panel.className = "sresult"
  document.body.appendChild(panel)
  expect(getComputedStyle(panel).backgroundColor).toBe("rgb(44, 52, 66)")
  await act(async () => storage.change({ darkMode: false }))
  expect(getComputedStyle(document.body).backgroundColor).toBe(originalBody)
  expect(
    getComputedStyle(document.querySelector(".tipbox")!).backgroundColor
  ).toBe("rgb(255, 255, 255)")
  expect(getComputedStyle(document.querySelector(".faculty")!).color).toBe(
    "rgb(68, 68, 68)"
  )
})

it("keeps the current CUNY Login card and labels readable, then restores its colors", async () => {
  const storage = connectLoginStorage()
  portalStyle = document.createElement("style")
  portalStyle.textContent = `.auth-shell { background: #f7f4eb; }
    .login-container { background: white; }
    .login-links { background: #fafafa; }
    .login-note { color: rgba(33, 37, 41, .85); }
    .accordion-toggle { color: #00274c; }
    .btn-toggle-password { background: white; color: white; }`
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `<main><div class="auth-shell"><div class="login-container">
    <label for="username">CUNY Login</label><input id="username">
    <button class="btn-toggle-password">Show password</button>
    <p class="login-note">For your security, log out when done.</p>
    <nav class="login-links"><button class="accordion-toggle">Support</button><a href="#help">Get Help</a></nav>
    </div></div></main>`
  stopHost = startHostTheme()
  await storage.change({ darkMode: true })
  const color = (selector: string, property: "color" | "backgroundColor") =>
    getComputedStyle(document.querySelector(selector)!)[property]
  expect(color(".auth-shell", "backgroundColor")).toBe("rgb(32, 36, 44)")
  expect(color(".login-container", "backgroundColor")).toBe("rgb(44, 52, 66)")
  expect(color(".login-links", "backgroundColor")).toBe("rgb(44, 52, 66)")
  expect(color(".login-note", "color")).toBe("rgb(219, 228, 240)")
  expect(color(".accordion-toggle", "color")).toBe("rgb(219, 228, 240)")
  expect(color(".btn-toggle-password", "backgroundColor")).toBe(
    "rgb(57, 73, 96)"
  )
  await storage.change({ darkMode: false })
  expect(color(".auth-shell", "backgroundColor")).toBe("rgb(247, 244, 235)")
  expect(color(".login-container", "backgroundColor")).toBe(
    "rgb(255, 255, 255)"
  )
  expect(color(".login-links", "backgroundColor")).toBe("rgb(250, 250, 250)")
})

it("keeps dark error, candidate, and rating states readable through retry and selection", async () => {
  connectLoginStorage({ darkMode: true })
  const candidate = {
    id: "1",
    legacyId: "1",
    name: "Alex Chen",
    schoolName: "Hunter College",
    profileUrl: "https://www.ratemyprofessors.com/professor/1",
    avgRating: 4.5,
    avgDifficulty: 4,
    tags: ["Clear grading"]
  }
  const sendMessage = vi
    .fn()
    .mockImplementationOnce((_message, callback) =>
      callback({ status: "error", error: "Offline" })
    )
    .mockImplementationOnce((_message, callback) =>
      callback({ status: "candidates", candidates: [candidate] })
    )
  vi.stubGlobal("chrome", {
    ...chrome,
    runtime: { ...chrome.runtime, sendMessage }
  })
  const instructor = document.createElement("div")
  instructor.textContent = "Alex Chen"
  document.body.appendChild(instructor)
  render(
    <RMPButton
      anchor={{
        element: instructor,
        type: "inline",
        insertPosition: "afterend"
      }}
    />
  )
  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: /view.*ratings/i }))
  expect(getComputedStyle(await screen.findByText(/Offline/)).color).toBe(
    "rgb(255, 163, 173)"
  )
  const retry = screen.getByRole("button", { name: "Retry search" })
  expect(getComputedStyle(retry).backgroundColor).toBe("rgb(44, 52, 66)")
  await user.click(retry)
  expect(
    getComputedStyle(screen.getByRole("link", { name: /Profile for/ })).color
  ).toBe("rgb(166, 200, 255)")
  await user.click(screen.getByRole("button", { name: /Show ratings for/ }))
  expect(getComputedStyle(screen.getByText("4.5")).color).toBe(
    "rgb(134, 231, 171)"
  )
  expect(getComputedStyle(screen.getByText("4.0 / 5")).color).toBe(
    "rgb(255, 163, 173)"
  )
  expect(screen.getByText("N/A")).toBeTruthy()
  expect(screen.getByText("Clear grading")).toBeTruthy()
})

it("updates an open professor dialog from storage without closing it or changing its contents", async () => {
  const storage = connectLoginStorage()
  vi.stubGlobal("chrome", {
    ...chrome,
    runtime: {
      ...chrome.runtime,
      sendMessage: vi.fn((_message, callback) => callback({ status: "empty" }))
    }
  })
  const instructor = document.createElement("div")
  instructor.textContent = "Alex Chen"
  document.body.appendChild(instructor)
  render(
    <RMPButton
      anchor={{
        element: instructor,
        type: "inline",
        insertPosition: "afterend"
      }}
    />
  )
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /view.*ratings/i }))
  await screen.findByText("No professor profiles found.")
  const dialog = screen.getByRole("dialog")
  expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)")
  await act(async () => storage.change({ darkMode: true }))
  expect(screen.getByRole("dialog")).toBe(dialog)
  expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(32, 36, 44)")
  expect(getComputedStyle(dialog).color).toBe("rgb(241, 245, 249)")
  await act(async () => storage.change({ darkMode: false }))
  expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)")
})

it("does not let a stale initial read overwrite a newer choice from another tab", async () => {
  const storage = connectLoginStorage()
  let finish: (data: Record<string, unknown>) => void = () => {}
  storage.get.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  stopHost = startHostTheme()
  await act(async () => storage.change({ darkMode: true }))
  await act(async () => finish({ darkMode: false }))
  expect(getComputedStyle(document.body).backgroundColor).toBe(
    "rgb(32, 36, 44)"
  )
})

it("darkens the visible Schedule Builder result cards", async () => {
  const storage = connectLoginStorage()
  portalStyle = document.createElement("style")
  portalStyle.textContent = `.reg_legend, .course_box, .legend_table { background-color: white; color: black; }`
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `<div id="page_results"><div id="flip_area"><div class="reg_legend"><div id="legend_box"><div class="course_box"><div class="legend_table">Course</div></div></div></div></div></div>`
  stopHost = startHostTheme()
  await act(async () => storage.change({ darkMode: true }))
  for (const selector of [".reg_legend", ".course_box", ".legend_table"])
    expect(
      getComputedStyle(document.querySelector(selector)!).backgroundColor
    ).toBe("rgb(44, 52, 66)")
})

it("keeps Schedule Builder timetable labels readable without recoloring course blocks", async () => {
  const storage = connectLoginStorage()
  portalStyle = document.createElement("style")
  portalStyle.textContent = `
    .timetable .weekArea tr.even { background-color: white; color: black; }
    .timetable .weekArea tr:first-child td { background-color: #e0e0e0; color: black; }
    .bc1 { background-color: rgb(165, 214, 167); color: #1a1a2e; }
  `
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `<div class="timetable"><div class="weekArea"><table><tbody>
    <tr><td>Day</td></tr><tr class="even"><td>Time</td><td><div class="bc1">Course</div></td></tr>
  </tbody></table></div></div>`
  const row = document.querySelector<HTMLElement>("tr.even")!
  const day = document.querySelector<HTMLElement>("tr:first-child td")!
  const course = document.querySelector<HTMLElement>(".bc1")!
  stopHost = startHostTheme()

  await act(async () => storage.change({ darkMode: true }))
  expect(getComputedStyle(row).backgroundColor).toBe("rgb(44, 52, 66)")
  expect(getComputedStyle(row).color).toBe("rgb(241, 245, 249)")
  expect(getComputedStyle(day).backgroundColor).toBe("rgb(57, 73, 96)")
  expect(getComputedStyle(day).color).toBe("rgb(241, 245, 249)")
  expect(getComputedStyle(course).backgroundColor).toBe("rgb(165, 214, 167)")
  expect(getComputedStyle(course).color).toBe("rgb(26, 26, 46)")

  await act(async () => storage.change({ darkMode: false }))
  expect(getComputedStyle(row).backgroundColor).toBe("rgb(255, 255, 255)")
  expect(getComputedStyle(row).color).toBe("rgb(0, 0, 0)")
  expect(getComputedStyle(day).backgroundColor).toBe("rgb(224, 224, 224)")
  expect(getComputedStyle(day).color).toBe("rgb(0, 0, 0)")
})

it("themes Schedule Builder selected-course list, course-block headings, Advanced Search, and Filters dialog", async () => {
  const storage = connectLoginStorage()
  portalStyle = document.createElement("style")
  portalStyle.textContent = `
    body { background-color: #ffffff; color: #000000; }
    .cbox, .rbox-has-reqid { background-color: #ffffff; }
    .cbox-cn { border-top: 7px solid #ffffff; border-bottom: 7px solid #ffffff; }
    .cbox-option { color: #555555; }
    .cbox-warnings { color: #a00a0a; }
    .cbox-hover-pin { background-color: #ffffff; }
    .msItemN { background-color: #f5f5f5; border: 1px solid #d9d9d9; }
    .msItemT { color: #222222; }
    .bc1 { background-color: rgb(165, 214, 167); }
    .advSearchButton { background-color: #ffffff; color: #757575; }
    .advSearchText { color: #000000; }
    .popup-wrapper { background-color: #ffffff; }
    .popup-title h3 { color: #333333; }
    .popup-subtitle { color: #777777; }
    .popup-body { color: #555555; }
  `
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `
    <div id="page_criteria">
      <div class="msItemN"><span class="msItemT">Main Campus</span></div>
      <div class="sdl_input plusInput">
        <label for="code_number">Select Course</label>
        <input id="code_number" type="text">
        <button class="advSearchButton" type="button">
          <div class="advSearchText">Advanced<br>Search</div>
          <i class="advSearchIcon"></i>
        </button>
      </div>
      <div id="requirements">
        <div class="requirementDiv2 rbox rbox-has-reqid">
          <div class="cbox">
            <table class="cbox-expand-region"><tbody><tr>
              <td class="cbox-codenumber"><div class="cbox-cn bc1">CSC<br>126</div></td>
              <td class="cbox-header"><span class="cbox-title">Intro to CS</span></td>
              <td class="cbox-option"><button class="mdl-button mdl-button--icon" type="button">Lock</button></td>
            </tr></tbody></table>
            <div class="cbox-warnings">All classes full</div>
            <div class="cbox-expansion">
              <span class="cbox-selitem cbox-classitem">
                <label class="cbox-checkbox"><input type="checkbox"><span class="cbox-selitem-label">Lec 01</span></label>
                <div class="cbox-hover-pin">Pin</div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="page_results">
      <div class="course_box"><div class="course_header bc1">
        <h4 class="course_title">CSC 126</h4>
        <label>Intro to CS</label>
      </div></div>
    </div>
    <div id="noticePopup" class="popup-wrapper">
      <div class="popup-title"><h3>Advanced Course Search</h3></div>
      <div class="popup-body">
        <div class="course-browsing">
          <div class="course-browsing-search">
            <div class="cb_filter_text">Selected campuses only</div>
            <table><tbody><tr><th>Academic Career:</th><td><select><option>Undergraduate</option></select></td></tr></tbody></table>
          </div>
          <div class="course-browsing-results">
            <span class="cb_switch_text">View selected only</span>
          </div>
        </div>
      </div>
    </div>
    <div id="popupfilter" class="popup-wrapper">
      <div class="popup-title">Filters</div>
      <div class="popup-body">
        <div class="popup-subtitle">Show me schedules containing:</div>
        <div class="rowfilter"><div class="filteroption"><label>Full classes</label></div></div>
      </div>
    </div>
  `
  stopHost = startHostTheme()

  await act(async () => storage.change({ darkMode: true }))
  const styleOf = (selector: string) =>
    getComputedStyle(document.querySelector<HTMLElement>(selector)!)

  expect(styleOf(".cbox").backgroundColor).toBe("rgb(44, 52, 66)")
  expect(styleOf(".cbox").color).toBe("rgb(241, 245, 249)")
  expect(styleOf(".rbox-has-reqid").backgroundColor).toBe("rgb(44, 52, 66)")
  expect(styleOf(".cbox-cn.bc1").backgroundColor).toBe("rgb(165, 214, 167)")
  expect(styleOf(".cbox-cn.bc1").color).toBe("rgb(26, 26, 46)")
  expect(styleOf(".cbox-cn.bc1").borderTopColor).toBe("rgb(44, 52, 66)")
  expect(styleOf(".cbox-option").color).toBe("rgb(219, 228, 240)")
  expect(styleOf(".cbox-warnings").color).toBe("rgb(255, 163, 173)")
  expect(styleOf(".cbox-hover-pin").backgroundColor).toBe("rgb(57, 73, 96)")
  expect(styleOf(".msItemN").backgroundColor).toBe("rgb(44, 52, 66)")
  expect(styleOf(".msItemT").color).toBe("rgb(219, 228, 240)")

  expect(styleOf(".course_header.bc1").backgroundColor).toBe("rgb(165, 214, 167)")
  expect(styleOf(".course_header.bc1 .course_title").color).toBe("rgb(26, 26, 46)")
  expect(styleOf(".course_header.bc1 label").color).toBe("rgb(26, 26, 46)")

  expect(styleOf(".advSearchButton").backgroundColor).toBe("rgb(44, 52, 66)")
  expect(styleOf(".advSearchText").color).toBe("rgb(241, 245, 249)")

  expect(styleOf("#noticePopup .popup-title h3").color).toBe("rgb(219, 228, 240)")
  expect(styleOf("#noticePopup .popup-body").color).toBe("rgb(241, 245, 249)")
  expect(styleOf(".course-browsing-search th").color).toBe("rgb(219, 228, 240)")
  expect(styleOf(".cb_filter_text").color).toBe("rgb(219, 228, 240)")
  expect(styleOf(".cb_switch_text").color).toBe("rgb(219, 228, 240)")
  expect(styleOf("#popupfilter .popup-subtitle").color).toBe("rgb(219, 228, 240)")

  await act(async () => storage.change({ darkMode: false }))
  expect(styleOf(".cbox").backgroundColor).toBe("rgb(255, 255, 255)")
  expect(styleOf("#popupfilter .popup-subtitle").color).toBe("rgb(119, 119, 119)")
})

it("themes CUNYfirst home tiles and restores the site's current theme", async () => {
  const storage = connectLoginStorage()
  portalStyle = document.createElement("style")
  portalStyle.textContent = `
    body, #PT_LANDINGPAGE { background-color: white; color: black; }
    #PT_WRAPPER { background: rgb(245, 249, 249) url(texture.svg); }
    #PT_HEADER { background-color: rgb(0, 57, 113); color: white; }
    .lpnavigation { background-color: rgb(232, 241, 240); }
    .nuilp { background-color: white; color: black; }
    .nuilp .ps-label, .nuilp .ps_box-value, .nuilp .cuCalendarDescription { color: black; }
    .nuilp[style] { color: rgb(100, 35, 20); }
    input { background-color: white; color: black; }
  `
  document.head.appendChild(portalStyle)
  document.body.innerHTML = `
    <form id="PT_LANDINGPAGE">
      <div id="PT_WRAPPER"><header id="PT_HEADER"><img alt="CUNY" src="cuny-logo.png">CUNYfirst Home</header>
        <nav class="lpnavigation"><span class="ps-label">CUNYfirst Home</span></nav>
        <main class="lptabpnl"><div class="lptab-cont">
          <div class="nuilp"><span class="ps-label">Student Center</span><span class="ps_box-value">Open records</span><span class="cuCalendarDescription">No Classes</span></div>
          <div class="nuilp" style="background-color: rgb(250, 220, 180)">CUNY Alert</div>
        </div></main>
        <label for="search">Search</label><input id="search">
      </div>
    </form>
  `
  const tile = document.querySelector<HTMLElement>(".nuilp")!
  const header = document.querySelector<HTMLElement>("#PT_HEADER")!
  stopHost = startHostTheme(cunyfirstHomeStyles)
  expect(getComputedStyle(tile).backgroundColor).toBe("rgb(255, 255, 255)")

  await act(async () => storage.change({ darkMode: true }))
  expect(
    getComputedStyle(document.querySelector("#PT_WRAPPER")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(
    getComputedStyle(document.querySelector("#PT_WRAPPER")!).backgroundImage
  ).toBe("none")
  expect(getComputedStyle(tile).backgroundColor).toBe("rgb(44, 52, 66)")
  expect(getComputedStyle(tile).color).toBe("rgb(241, 245, 249)")
  for (const selector of [
    ".nuilp .ps-label",
    ".nuilp .ps_box-value",
    ".nuilp .cuCalendarDescription"
  ])
    expect(getComputedStyle(document.querySelector(selector)!).color).toBe(
      "rgb(241, 245, 249)"
    )
  expect(
    getComputedStyle(document.querySelector(".lpnavigation")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector("input")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(getComputedStyle(header).backgroundColor).toBe("rgb(0, 57, 113)")
  expect(header.querySelector("img")!.getAttribute("src")).toBe("cuny-logo.png")
  const alertTile = document.querySelector<HTMLElement>(".nuilp[style]")!
  expect(getComputedStyle(alertTile).backgroundColor).toBe("rgb(250, 220, 180)")
  expect(getComputedStyle(alertTile).color).toBe("rgb(100, 35, 20)")

  portalStyle.textContent += `.nuilp { background-color: rgb(245, 240, 230); }`
  await act(async () => storage.change({ darkMode: false }))
  expect(getComputedStyle(tile).backgroundColor).toBe("rgb(245, 240, 230)")
  expect(
    getComputedStyle(document.querySelector(".nuilp .ps-label")!).color
  ).toBe("rgb(0, 0, 0)")
})

it("uses the saved dark setting for newly opened CUNYfirst home content", async () => {
  connectLoginStorage({ darkMode: true })
  stopHost = startHostTheme(cunyfirstHomeStyles)
  await waitFor(() =>
    expect(document.documentElement.hasAttribute("data-cuny-plus-dark")).toBe(
      true
    )
  )
  document.body.innerHTML = `<form id="PT_LANDINGPAGE"><div id="PT_WRAPPER"><div class="nuilp">Student Center</div></div></form>`
  expect(
    getComputedStyle(document.querySelector(".nuilp")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
})
