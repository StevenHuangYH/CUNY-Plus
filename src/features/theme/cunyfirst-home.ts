// PeopleSoft Fluid home surfaces and neutral tiles. Leave the CUNY header,
// tile imagery, inline colors, and explicit PeopleSoft color themes alone.
const root = "html[data-cuny-plus-dark]"
const neutralInlineBackground = `
  [style*="background-color: white" i], [style*="background-color:white" i],
  [style*="background-color: #fff" i], [style*="background-color:#fff" i],
  [style*="background: white" i], [style*="background:white" i],
  [style*="background: #fff" i], [style*="background:#fff" i],
  [style*="background-color: rgb(255, 255, 255)" i],
  [style*="background-color:rgb(255,255,255)" i]`
const neutralTile = `${root} .nuilp:not([class*="psc_theme-"]):is(:not([style*="background"]), ${neutralInlineBackground})`

export const cunyfirstHomeStyles = `
${root} { color-scheme: dark; background-color: #20242c !important; }
${root} body { background-color: #20242c !important; color: #f1f5f9 !important; }
${root} :is(#PT_LANDINGPAGE, #PT_WRAPPER, #PT_MID_SECTION, .lptabpnl, .lptab-cont) {
  background-color: #20242c !important;
  color: #f1f5f9 !important;
}
/* PeopleSoft's light geometric texture is decorative, not a course or status image. */
${root} #PT_WRAPPER { background-image: none !important; }
${root} .lpnavigation {
  background-color: #2c3442 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${root} :is(#PT_PNL2_TITLE, .lpnavigation .ps-label, .lpnavigation .ps-text) {
  color: #dbe4f0 !important;
}
${neutralTile} {
  background-color: #2c3442 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${neutralTile} :is(.ps-label, .ps_box-value, .cuCalendarDate, .cuCalendarDescription) {
  color: #f1f5f9 !important;
}
${neutralTile}:hover,
${neutralTile}:focus-visible {
  background-color: #394960 !important;
}
${root} a:not(.nuilp, .nuilp *, #PT_HEADER a) {
  color: #a6c8ff !important;
}
${root} :is(input, select, textarea) {
  background-color: #20242c !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${root} :is(input, textarea)::placeholder { color: #b7c2d2 !important; opacity: 1; }
${root} :is(button, input, select, textarea, a):focus-visible {
  outline: 2px solid #93c5fd !important;
  outline-offset: 2px;
}
`
