# Dark mode verification

Issue: [#11](https://github.com/StevenHuangYH/CUNY-Plus/issues/11). Verified on 2026-10-24 in Chrome with the locally installed CUNY Plus extension.

## Checks completed

- One popup toggle changed the `data-cuny-plus-dark` state in already open CUNY Login, Schedule Builder, and Brightspace tabs without a refresh. Toggling off removed it from all three.
- On the Brightspace home page, the body, navigation, and widgets changed from their site's light colors to the extension's dark colors and back. The existing course images and branded navigation remained in place.
- A newly loaded CUNY Login page read the saved dark choice. The popup initially showed Dark mode off, and automated tests cover the light default, saved choice, and restoration after a site theme change.
- Real CUNY Login inspection found a light shell, card, and help panel behind light text. Real Brightspace inspection found dark text in the account menu, calendar dates, and Work To Do due date on dark surfaces. Focused tests now cover the corresponding CSS repairs.

## Checks still required on the updated extension

- Reload the updated extension and inspect the repaired CUNY Login and Brightspace pages in Chrome.
- Sign in again to CUNYfirst and Brightspace. The browser sessions expired during this check, so Student Center, CUNYfirst home, a Schedule Builder result, Brightspace assignments, and quizzes still need real-page inspection.
- With those pages open together, repeat the popup toggle, then change any available site theme while extension dark mode is on and confirm the site's latest appearance returns when it is turned off.
- Check a new page and a browser restart for the saved setting. A first-install default was verified in automated tests; the existing installed profile cannot represent a first install.
- Inspect page load for a noticeable light flash. Content scripts start at `document_start`, but the saved setting is read asynchronously, so a brief flash may remain on some pages.

The extension does not theme Brightspace course files or third-party embedded tools. Their presentation belongs to the source content.
