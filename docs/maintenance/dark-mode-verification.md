# Dark mode verification

Issue: [#11](https://github.com/StevenHuangYH/CUNY-Plus/issues/11). Verified on 2026-10-24 in Chrome with the locally installed CUNY Plus extension.

## Regression found after the initial verification

- A later live visit to the 2027 Spring Schedule Builder working screen exposed a white selected-course row behind light text, a light course label on a green course block, and black Advanced Search text on a dark button. Approximate contrast ratios were 1.1:1, 1.3:1, and 1.7:1 respectively. The Advanced Search panel retained dark gray field labels on dark surfaces at about 1.7:1; the Filters dialog also retained a dim subtitle. Issue #11 was reopened; the earlier timetable-only check did not cover these surfaces.

## Checks completed

- One popup toggle changed the `data-cuny-plus-dark` state in already open CUNY Login, Schedule Builder, and Brightspace tabs without a refresh. Toggling off removed it from all three.
- On the Brightspace home page, the body, navigation, and widgets changed from their site's light colors to the extension's dark colors and back. The existing course images and branded navigation remained in place.
- A newly loaded CUNY Login page read the saved dark choice. The popup initially showed Dark mode off, and automated tests cover the light default, saved choice, and restoration after a site theme change.
- Real CUNY Login inspection found a light shell, card, and help panel behind light text. Real Brightspace inspection found dark text in the account menu, calendar dates, and Work To Do due date on dark surfaces. Focused tests now cover the corresponding CSS repairs.
- After reloading the updated extension, the real CUNY Login shell changed to `rgb(32, 36, 44)` and the card and help panel to `rgb(44, 52, 66)`. Labels, note, links, and password visibility control were legible in the screenshot. Turning Dark mode off restored the site's original shell and card colors. A newly opened CUNY Login page also used the saved dark choice.
- A Brightspace course-content viewer remained unthemed when the extension switch was on. It had no extension dark marker or injected theme stylesheet; its author-provided content was left alone.
- After signing in again, Brightspace home and CUNYfirst home loaded successfully, and Schedule Builder's sign-in flow reached its criteria page. All three pages had the extension theme stylesheet present and the dark marker absent while the saved switch was off.
- Turning Dark mode on marked the already open Brightspace home, CUNYfirst home, and Schedule Builder criteria pages without reloading them. Their body backgrounds became `rgb(32, 36, 44)` with light text. Brightspace widgets and navigation, the CUNYfirst navigation and neutral Student Center tiles, and Schedule Builder buttons also used the intended dark surfaces and readable text.
- On the updated Brightspace college home, the account name, calendar dates, and Work To Do due date computed to light text colors. The course cards used dark surfaces, and course imagery and branded navigation remained present. A fresh Brightspace college home page used the saved dark setting after load.
- A signed-in Schedule Builder result exposed white timetable rows and gray day cells behind inherited light text. A focused test reproduced the contrast problem. After reloading the updated extension and result page, the timetable rows computed to `rgb(44, 52, 66)` and day headers to `rgb(57, 73, 96)`, both with `rgb(241, 245, 249)` text. The schedule result remained present. The regression test also confirms colored course blocks keep their colors.
- The saved dark choice survived reloading the extension itself: the Schedule Builder result loaded dark again after the extension and page reloads.
- After Chrome reconnected with a new browser session and restored tabs, a fresh Brightspace college home page read the saved dark choice and used the dark body surface. This is the live browser-restart persistence check.
- Brightspace assignments and quizzes opened in the signed-in course with the dark marker active. Both used the dark body surface and light headings; the assignments page links used either light text or the extension's blue link color.
- After switching Dark mode off, fresh Brightspace college home, CUNYfirst Student Center, and Schedule Builder criteria pages loaded without the dark marker. Their body backgrounds returned to the sites' light colors (`rgb(246, 247, 248)` for Brightspace and white for the two CUNYfirst pages). The previously open QA tabs were no longer available for a same-tab restoration check; the earlier popup-toggle check above covered same-tab restoration.

## Verification limits

- No theme or appearance control was exposed in the inspected Brightspace Account Settings and CUNYfirst My Preferences pages, so the dynamic site-theme change is covered by automated tests rather than a live setting change.
- The existing installed profile cannot represent a first install, which is verified in tests. The implementation uses `chrome.storage.local`, which [Chrome documents as persistent local extension storage](https://developer.chrome.com/docs/extensions/reference/api/storage).
- Fresh pages were dark at the first settled observation, but that does not rule out a brief light flash during navigation. Content scripts start at `document_start`, while the saved setting is read asynchronously, so a brief flash may remain on some pages.

The extension does not theme Brightspace course files or third-party embedded tools. Their presentation belongs to the source content.
