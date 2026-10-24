# Dark mode verification

Issue: [#11](https://github.com/StevenHuangYH/CUNY-Plus/issues/11). Verified on 2026-10-24 in Chrome with the locally installed CUNY Plus extension.

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
- A signed-in Schedule Builder result exposed white timetable rows and gray day cells behind inherited light text. A focused test reproduced the contrast problem, and the timetable styles now darken those grid surfaces while leaving colored course blocks unchanged. The updated code still needs a live extension reload to confirm this repair.
- Brightspace assignments and quizzes opened in the signed-in course with the dark marker active. Both used the dark body surface and light headings; the assignments page links used either light text or the extension's blue link color.

## Checks still required on the updated extension

- Reload the latest extension build and confirm the repaired Schedule Builder timetable in a live result.
- Toggle the open pages back off, then change any available site theme while extension dark mode is on and confirm the site's latest appearance returns when it is turned off.
- Check a new page and a browser restart for the saved setting. A first-install default was verified in automated tests; the existing installed profile cannot represent a first install.
- Inspect page load for a noticeable light flash. Content scripts start at `document_start`, but the saved setting is read asynchronously, so a brief flash may remain on some pages.

The extension does not theme Brightspace course files or third-party embedded tools. Their presentation belongs to the source content.
