// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest"

import { cunyfirstFunctionsStyles } from "../src/features/theme/cunyfirst-functions"
import { startHostTheme } from "../src/features/theme/host-page"
import { connectLoginStorage } from "./login-fixture"

let stop: (() => void) | undefined
afterEach(() => {
  stop?.()
  stop = undefined
  document.head.innerHTML = ""
  document.body.innerHTML = ""
})

it("updates an open Student Tools page and restores the site's latest colors", async () => {
  const storage = connectLoginStorage()
  const site = document.createElement("style")
  site.textContent = `
    body, .PSForm { background: white; color: #161513; }
    .ps_pagetitle_cont { background: #e8f1f0; }
    #PT_SIDE, .ps_grid-col { background: #f5f9f9; }
    .ps-label { color: #444; }
    .ps-dropdown { background: white; color: #161513; }
    .ps_header_bar { background: #0033a1; color: white; }
    .ps_ag-step-button.psc_selected { background: #f5debd; color: #161513; }
  `
  document.head.appendChild(site)
  document.body.innerHTML = `<form class="PSForm" id="PT_AGSTARTPAGE_NUI">
    <div class="ps_header_bar"><img src="cuny-logo.png" alt="CUNYfirst"></div>
    <div class="ps_pagetitle_cont"><h1 class="ps_pagetitle">Student Tools</h1></div>
    <div id="PT_SIDE"><div class="ps_ag-step-button psc_selected"><span class="ps-label">Document Upload</span></div></div>
    <main id="PT_MID_SECTION"><label class="ps-label">Document class</label><select class="ps-dropdown"><option>Choose</option></select>
      <table><tr><th class="ps_grid-col">Document</th></tr></table></main>
  </form>`
  const form = document.querySelector(".PSForm")!
  const title = document.querySelector(".ps_pagetitle_cont")!
  const selected = document.querySelector(".psc_selected")!
  const header = document.querySelector(".ps_header_bar")!
  stop = startHostTheme(cunyfirstFunctionsStyles)
  await storage.change({ darkMode: true })
  expect(getComputedStyle(form).backgroundColor).toBe("rgb(32, 36, 44)")
  expect(getComputedStyle(title).backgroundColor).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector("#PT_SIDE")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector(".ps_grid-col")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector(".ps-dropdown")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(getComputedStyle(document.querySelector(".ps-dropdown")!).color).toBe(
    "rgb(241, 245, 249)"
  )
  expect(getComputedStyle(header).backgroundColor).toBe("rgb(0, 51, 161)")
  expect(header.querySelector("img")!.getAttribute("src")).toBe("cuny-logo.png")
  expect(getComputedStyle(selected).backgroundColor).toBe("rgb(245, 222, 189)")
  expect(getComputedStyle(selected.querySelector(".ps-label")!).color).toBe(
    "rgb(26, 26, 46)"
  )
  site.textContent += `.ps_pagetitle_cont { background: #ddd; }`
  await storage.change({ darkMode: false })
  expect(getComputedStyle(form).backgroundColor).toBe("rgb(255, 255, 255)")
  expect(getComputedStyle(title).backgroundColor).toBe("rgb(221, 221, 221)")
})

it("uses the saved setting on a new Manage Classes page without recoloring course states", async () => {
  connectLoginStorage({ darkMode: true })
  const site = document.createElement("style")
  site.textContent = `.PSForm { background: white; } .ps_apps_pageheader, .ps_grid-col { background: #f5f9f9; }
    .psc_selected { background: #b9ddfb; color: #161513; }
    .ps_box-radio .ps_box-label { background: white; color: #161513; }
    .ps_box-radio.psc_selected .ps_box-label { background: #f5debd; }
    .course-status { background: #92d8ad; color: #10261b; }`
  document.head.appendChild(site)
  stop = startHostTheme(cunyfirstFunctionsStyles)
  document.body.innerHTML = `<form class="PSForm" id="SSR_MD_SP_FL"><div class="ps_apps_pageheader">Manage Classes</div>
    <aside id="PT_SIDE"><div class="psc_selected"><span class="ps-text">View My Classes</span></div></aside>
    <div class="ps_box-radio"><div class="ps_box-label">List view</div></div>
    <div class="ps_box-radio psc_selected"><div class="ps_box-label">Calendar view</div></div>
    <table><tr><th class="ps_grid-col">Course</th><td><span class="course-status">Enrolled</span></td></tr></table>
    <div class="calendar-course" style="background-color: rgb(250, 220, 180); color: rgb(38, 28, 16)">Class</div></form>`
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(
    getComputedStyle(document.querySelector(".ps_apps_pageheader")!)
      .backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector(".ps_grid-col")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(document.querySelector(".psc_selected")!).backgroundColor
  ).toBe("rgb(185, 221, 251)")
  expect(
    getComputedStyle(
      document.querySelector(".ps_box-radio:not(.psc_selected) .ps_box-label")!
    ).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(
    getComputedStyle(
      document.querySelector(".ps_box-radio.psc_selected .ps_box-label")!
    ).backgroundColor
  ).toBe("rgb(245, 222, 189)")
  expect(
    getComputedStyle(document.querySelector(".course-status")!).backgroundColor
  ).toBe("rgb(146, 216, 173)")
  expect(
    getComputedStyle(document.querySelector(".calendar-course")!)
      .backgroundColor
  ).toBe("rgb(250, 220, 180)")
})

it("keeps function dialogs, links, and grid text readable while preserving status fills", async () => {
  const storage = connectLoginStorage()
  const site = document.createElement("style")
  site.textContent = `.PSForm, .ps_modal { background: white; color: #161513; }
    .ps_grid-cell { color: #161513; }
    .ps-link { color: #116eb1; }
    .psc_confirmation-area { background: #b9ddfb; color: #161513; }
    .ps_modal { border: 1px solid #aaa; }`
  document.head.appendChild(site)
  document.body.innerHTML = `<form class="PSForm"><div class="psc_confirmation-area"><span class="ps_box-value">Saved</span></div>
    <table><tr><td class="ps_grid-cell">Course</td></tr></table>
    <a class="ps-link" href="#details">Details</a>
    <div class="ps_modal"><label class="ps-label" for="notes">Notes</label><textarea id="notes"></textarea></div></form>`
  stop = startHostTheme(cunyfirstFunctionsStyles)
  await storage.change({ darkMode: true })
  expect(
    getComputedStyle(document.querySelector(".ps_modal")!).backgroundColor
  ).toBe("rgb(44, 52, 66)")
  expect(getComputedStyle(document.querySelector(".ps_grid-cell")!).color).toBe(
    "rgb(241, 245, 249)"
  )
  expect(getComputedStyle(document.querySelector(".ps-link")!).color).toBe(
    "rgb(166, 200, 255)"
  )
  expect(
    getComputedStyle(document.querySelector("textarea")!).backgroundColor
  ).toBe("rgb(32, 36, 44)")
  expect(
    getComputedStyle(document.querySelector(".psc_confirmation-area")!)
      .backgroundColor
  ).toBe("rgb(185, 221, 251)")
  expect(
    getComputedStyle(
      document.querySelector(".psc_confirmation-area .ps_box-value")!
    ).color
  ).toBe("rgb(26, 26, 46)")
  await storage.change({ darkMode: false })
  expect(
    getComputedStyle(document.querySelector(".ps_modal")!).backgroundColor
  ).toBe("rgb(255, 255, 255)")
})
