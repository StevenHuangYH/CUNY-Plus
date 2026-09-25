<div align="center">
  <h1>CUNY Plus</h1>
  <img src="assets/icon.png" alt="logo" style="width: 100px; border-radius: 15%; margin: 20px 0;" />
  <p><em>No more switching tabs between CUNY Schedule Builder and RateMyProfessors.</em></p>
</div>

---

**CUNY Plus** is a Chrome extension built specifically for students in the City University of New York (CUNY) system. It seamlessly integrates instructor ratings right into your class search, so you can build your schedule with confidence and speed.

## What it does

Instead of copying and pasting professor names into a new tab, CUNY Plus does the heavy lifting for you:

- **Instant RMP Ratings:** Injects a sleek "C+ RMP" button right next to every professor's name on CUNY class search and scheduling pages.
- **At-a-Glance Professor Profiles:** Clicking the badge opens a modern pop-up card showing the professor's overall quality score, difficulty rating, top student feedback tags, and how many students would take them again.
- **Professor Identity Matching:** Scores appear automatically only for a unique full-name and campus match. When the campus is missing, a name is abbreviated, or several profiles could match, choose a professor from a list showing their actual name, school, and profile link. Cross-campus and non-CUNY candidates always require your choice. Choices last only while that course context remains on the current page.
- **One-Click Auto Login:** Tired of typing your long `firstname.last##@login.cuny.edu` every time you log into CUNY SSO? Save it securely in the extension popup, and we'll auto-fill and submit it for you.

## How it works

The extension is built on top of the [Plasmo](https://docs.plasmo.com/) framework, using React and Tailwind CSS. We use Shadow DOM injection to make sure our UI components don't clash with the older styling of the CUNY portals.

## Installation

### Via the Chrome Web Store (Recommended)

_Note: The extension is currently pending review in the Chrome Web Store. The direct link will be added here as soon as it is published._

1. Go to the Chrome Web Store (link coming soon).
2. Click **Add to Chrome** to install.
3. Pin the extension to your toolbar for quick access to your login configurations.

## Want to test it locally?

If you want to hack on this or just run it yourself:

1. Clone the repo and install dependencies with `npm install`.
2. Run `npm run dev` for a live-reloading development build, or `npm run build` for a production bundle.
3. Open `chrome://extensions/`, turn on **Developer mode**, click **Load unpacked**, and select the `build/chrome-mv3-prod` (or `dev`) folder.
4. To test without a CUNY account, keep `npm run dev` running, load `build/chrome-mv3-dev`, and run `npm run simulator` in another terminal. Open **http://127.0.0.1:4173/test.html**. The committed `.env.development` adds public localhost origins through [Plasmo's environment configuration](https://docs.plasmo.com/framework/env); the production build continues to match only CUNY pages. Opening `test.html` directly as a file does not inject the extension.

The simulator offers editable instructor and campus fields for checking unknown campuses, abbreviated names, and changes while a search is pending. It uses live RateMyProfessors searches, so its results depend on remote availability. Automated tests use deterministic responses and do not contact CUNY or RateMyProfessors.

Run `npm test`, `npm run typecheck`, and `npm run build` before shipping. The test tooling supports Node 22 or newer. Automatic school matching requires a recognized [CUNY school name](https://www.cuny.edu/about/colleges/) and an exact comparison after normalizing case and whitespace; unfamiliar aliases deliberately go to candidate selection. Professor searches time out after ten seconds and show a retry action. Missing scores display as N/A.

Use `npm ci` for a reproducible install. Installation applies a checked security patch to Plasmo's older Parcel development server; the development, build, and package scripts verify it before running. `npm audit` still reports four moderate entries for this locally patched advisory. See [dependency security maintenance](docs/maintenance/dependency-security.md) for the version overrides, regression test, and upstream limitation.

Auto Login shows “Saved” only after settings are stored successfully. A failed save keeps your input available for retry. Each save permits one automatic submission per CUNY Login tab session; after correcting credentials, click Save again to request a new attempt. Repeated login redirects do not trigger repeated attempts. Disabling Auto Login clears stored credentials after the write succeeds. See [auto-login reliability](docs/design/auto-login-reliability.md) for behavior and test coverage.

## Feedback & Contributions

If you find a bug, want a new feature, or just want to help out, feel free to open an issue or submit a pull request!
