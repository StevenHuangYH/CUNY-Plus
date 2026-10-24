import { getTheme, subscribeTheme } from "./store"

const root = "html[data-cuny-plus-dark]"
// Never let portal styles override extension-owned dialogs or their children.
const host = (selectors: string) =>
  `${root} :is(${selectors}):not([data-cuny-plus-ui], [data-cuny-plus-ui] *)`
const pastelSurfaces = `.bc0, .bc1, .bc2, .bc3, .bc4, .bc5, .bc6, .bc7,
  .bc8, .bc9, .bc10, .bc11, .bc12, .bl0, .bl1, .bl2, .bl3, .bl4,
  .bl5, .bl6, .bl7, .bl8, .bl9, .bl10, .bl11, .bl12, .bubble, .highlight,
  .cb-search-selection, .exclBlock, .timeHigh`

const styles = `
${root} { color-scheme: dark; background-color: #20242c !important; }
${host("body")} { background-color: #20242c !important; color: #f1f5f9 !important; }
${host(".auth-shell")} { background-color: #20242c !important; }

/* Neutral surfaces from Schedule Builder and CUNY Login's public stylesheets.
   Keep background images, branded headers, calendar colors and status badges. */
${host(`.white-background, .courses_bg, .main_menu, .helpinfo, .requirement,
  .cbox, .rbox-has-reqid, .msItemN, .mdl-chip, .legend_box, #legend_box,
  .popup-wrapper, .morelink, .sdl_input label, .advSearchButton,
  #page_criteria, #page_results, .reg_legend, .course_box, .legend_table,
  .table_container, .sresult, .subnavigation,
  .course_cell_action, .linkBox, .share-link-input, .StuTableTitle, .StuTableData,
  .LegendLabel, .LegendItem, .selectize-dropdown, .selectize-input,
  .sod_select, .sod_select .sod_list_wrapper, .ui-widget-content, .ui-widget-header,
  body .ui-tooltip, .imp-list, .imp-choice-shadow, .rec-scrol-div,
  .course-browsing-results-listing,
  .mdl-card, .mdl-dialog, #cboxLoadedContent, .form_wrapper, .login_form,
  .login-container, .login-links,
  .row.two, .footer1, .footer2, #popup, .bottomAdvice, .enrollmentEncouragement,
  .tipbox, .nothing, #legend_headers, .disabled-term-selection,
  .action-required-hold .term-card-title, a.top_access_link,
  tr.cb-search-results-previous td`)} {
  background-color: #2c3442 !important;
  background-image: none !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${host(".cbox-cn")} {
  border-top-color: #2c3442 !important;
  border-bottom-color: #2c3442 !important;
}
${host(".popup-body, .advSearchButton *, .advSearchText, .advSearchIcon")} {
  color: #f1f5f9 !important;
}
${host("#no_results_message_div, #no_cnfs_div")} {
  background-image: none !important;
  color: #dbe4f0 !important;
}
${host(`h1, h2, h3, h4, label, .p, .cuny-text, [id="popup"] p, [id="popup"] h2,
  .semibold, .title, .subsubtitle, .campus_block, .instructional_method_block,
  .location_block, .no_favs_notice, .saved_notice, .warning_fav_notsignedin,
  .vsb_tab_button, .course_cell_option, .faculty, .campus, .empty_warning,
  .fa.settings_icon, .courseCount1, .dp-legend-title, .cbox-option, .msItemT,
  .mdl-chip__text, .mdl-chip__action, .popup-title, .popup-title h3,
  .popup-subtitle, .popupNoticeButtonMessage, .select-course-title,
  .course-browsing th, .cb_filter_text, .cb_switch_text, .cb-search-label,
  .cb-no-results, .sdl_input.is-length label, .filter_label,
  .rowfilter .filteroption`)} { color: #dbe4f0 !important; }
${host(".course_cell_option")}::before { color: #dbe4f0 !important; }
${host("a, .a")} { color: #a6c8ff !important; }
${host(".navigation a, .support-links a, .cuny_header a")} { color: #ffffff !important; }
${host(".login-note, .login-links .accordion-toggle")} { color: #dbe4f0 !important; }
/* Schedule Builder's timetable keeps white rows and gray day headers behind
   inherited light text. Course blocks inside the cells retain their colors. */
${host(".timetable .weekArea tr.even, .timetable .weekArea tr.odd")} {
  background-color: #2c3442 !important;
  color: #f1f5f9 !important;
}
${host(".timetable .weekArea tr:first-child td")} {
  background-color: #394960 !important;
  color: #f1f5f9 !important;
}

${host(`input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),
  select, textarea, option`)} {
  background-color: #20242c !important; color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${host("input, textarea")}::placeholder { color: #b7c2d2 !important; opacity: 1; }
${host("button, input, select, textarea, a")}:focus-visible {
  outline: 2px solid #93c5fd !important; outline-offset: 2px;
}
${host(`.button, .small_button, .mdl-button:not(.mdl-button--accent), .nobuttonstyle,
  .cbox-desc-title, .cbox-hover-pin, .cbox-hover-pin-old, .Dmdl-button,
  .selectAll, .selectNone`)} {
  background-color: #394960 !important; background-image: none !important;
  color: #f1f5f9 !important; border-color: #56647a !important;
}
${host(".btn-toggle-password")} {
  background-color: #394960 !important;
  color: #f1f5f9 !important;
  border-color: #56647a !important;
}
${host(".main_menu a:hover, .term-card-title:hover, .advSearchButton:hover")} {
  background-color: #394960 !important;
}
${host(".vsb_tab_button.selected")} { color: #a6c8ff !important; border-bottom-color: #a6c8ff !important; }
${host("button:disabled, input:disabled, .disabled-term-selection")} { opacity: .6; }
${host(`.error-message, .warningNoteBad, .sorry_msg, .dw-select-error, .dp-select-error,
  .term-selection-hold-item, .fullText, .validate_bad, .actionFailTitle, .actionFailMessage,
  .action-required-hold .term-card-title, .cbox-warnings, .cbox-select-wildcard .select-title,
  .full_warning_cbox, .textnonevisible`)} {
  color: #ffa3ad !important;
}
${host(".cbox-selitem-label.full")}::after { color: #ffa3ad !important; }
${host(".warningNoteGood, .dw-select-success, .dp-select-success, .button_do_actions")} { color: #86e7ab !important; }
${host(".waitText")} { color: #fcd37a !important; }
${host(".cbox-selitem-label.waitlisted")}::after { color: #fcd37a !important; }
/* Calendar blocks retain their original pastel colors and dark text. */
${host(pastelSurfaces)},
${host(`:is(${pastelSurfaces}) *, #page_criteria :is(${pastelSurfaces}), #page_criteria :is(${pastelSurfaces}) *, #page_results :is(${pastelSurfaces}), #page_results :is(${pastelSurfaces}) *`)} {
  color: #1a1a2e !important;
}
`

export function startHostTheme(siteStyles = styles) {
  const style = document.createElement("style")
  style.textContent = siteStyles
  document.documentElement.appendChild(style)
  const apply = () => {
    document.documentElement.toggleAttribute(
      "data-cuny-plus-dark",
      getTheme().dark
    )
  }
  const unsubscribe = subscribeTheme(apply)
  apply()
  return () => {
    unsubscribe()
    style.remove()
    document.documentElement.removeAttribute("data-cuny-plus-dark")
  }
}
