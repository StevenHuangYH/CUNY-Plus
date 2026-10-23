// PeopleSoft Fluid function pages reached from Student Center. Preserve the
// branded header, selected navigation, status fills, images, and course colors.
const root = "html[data-cuny-plus-dark]"

export const cunyfirstFunctionsStyles = `
${root} { color-scheme: dark; background-color: #20242c !important; }
${root} body,
${root} form.PSForm {
  background-color: #20242c !important;
  color: #f1f5f9 !important;
}
${root} :is(#PT_WRAPPER, #PT_MID_SECTION, #PT_CENTER, .ps_pagecontainer) {
  color: #f1f5f9 !important;
}
${root} :is(.ps_pagetitle_cont, .ps_apps_pageheader, #PT_SIDE,
  .ps_grid-col, .ps_grid-head-row, .ps_modal, .ps_dialog, .ps-popup) {
  background-color: #2c3442 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${root} .ps_box-radio:not(.psc_selected) > .ps_box-label {
  background-color: #2c3442 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${root} :is(.ps_pagetitle, .ps-label, .ps-text, .ps_box-value,
  .ps_header-group, .ps_grid-col, .ps_grid-cell, label):not(.ps_header_bar *,
  .psc_selected *, [style*="background"] *, [class*="status"] *,
  [class*="calendar"] *) {
  color: #f1f5f9 !important;
}
${root} :is(a.ps-link, a.ps-button):not(.ps_header_bar *, .psc_selected *) {
  color: #a6c8ff !important;
}
${root} :is(input:not([type=checkbox]):not([type=radio]):not([type=hidden]),
  select, textarea, option) {
  background-color: #20242c !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${root} :is(input, textarea)::placeholder { color: #b7c2d2 !important; opacity: 1; }
${root} :is(a.ps-button, button):not(.ps_header_bar *, .psc_selected *,
  [style*="background"], [class*="status"]) {
  background-color: #394960 !important;
  border-color: #56647a !important;
}
${root} :is(a, button, input, select, textarea):focus-visible {
  outline: 2px solid #93c5fd !important;
  outline-offset: 2px;
}
/* PeopleSoft uses light blue and amber fills to mark active steps and tabs. */
${root} .psc_selected :is(.ps-label, .ps-text, .ps-link, .ps_box-value),
${root} .psc_confirmation-area :is(.ps-label, .ps-text, .ps_box-value) {
  color: #1a1a2e !important;
}
${root} .psc_selected { color: #1a1a2e !important; }
${root} .ps_header_bar :is(.ps-label, .ps-text, .ps-link, .ps_box-value) {
  color: #fbf9f8 !important;
}
`
