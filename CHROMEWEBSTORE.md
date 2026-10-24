# Chrome Web Store Listing — CUNY Plus

> Last Updated: 2026-10-24

## Store Listing

**Extension Name**
CUNY Plus

**Short Description** (128 characters, matches `manifest.json`)
Inline RateMyProfessors ratings, schedule copy, dark mode, and auto-login for CUNY Schedule Builder, CUNYfirst, and Brightspace.

**Detailed Description**
CUNY Plus brings inline RateMyProfessors ratings, one-click schedule copying, dark mode across CUNYfirst and Brightspace, quick portal links, and optional CUNY Login autofill into one lightweight browser extension for City University of New York (CUNY) students.

FEATURES
• Inline RateMyProfessors Ratings — Adds a "C+ RMP" button next to instructor names on CUNY Schedule Builder and class search pages. Click to view overall quality, difficulty, would-take-again percentage, total ratings, and top student feedback tags without leaving your schedule.
• Accurate Professor Identity Matching — Automatically shows ratings only when an instructor's full name and CUNY campus match unambiguously. When a name is abbreviated, a campus is missing, or multiple profiles match, you can pick the right professor from a clear candidate list with direct links to RateMyProfessors.
• One-Click Schedule Copy (New in 0.2.0) — Copy the currently displayed Schedule Builder option as readable plain text ("Copy text") or a spreadsheet-ready tab-separated table ("Copy table"). Preserves multiple meeting times, asynchronous components, multiple instructors, and any professor ratings you have already viewed.
• Full Dark Mode Across CUNYfirst & Brightspace (Updated in 0.2.0) — Toggle Dark mode from the extension popup to immediately theme CUNY Login, CUNYfirst home, Student Center, CUNYfirst function pages, Schedule Builder, and Brightspace platform pages (course lists, assignments, and quizzes). Preserves course calendar colors, school branding, instructor-uploaded course files, and third-party embedded tools, and restores each site's original appearance when turned off.
• Quick Access Portal Links (New in 0.2.0) — Open Brightspace, Student Center (via CUNYfirst home), or DegreeWorks in a new tab directly from the extension popup.
• Optional One-Click Auto Login — Save your CUNY Login username and password locally in your browser to automatically fill and submit the CUNY SSO sign-in form. Includes loop prevention so a failed sign-in never retries infinitely until you explicitly save updated credentials.

HOW TO USE
1. Install CUNY Plus and pin it to your Chrome toolbar.
2. Open the extension popup to toggle Dark mode, use Quick access links (Brightspace, Student Center, DegreeWorks), or optionally save your CUNY Login credentials.
3. Visit CUNY Schedule Builder and click any "C+ RMP" badge next to an instructor's name to view their RateMyProfessors profile card, or click "Copy text" / "Copy table" above the schedule legend to copy your current schedule option.

PRIVACY
CUNY Plus does not collect telemetry, analytics, or personal data on any external server. Your theme preference and optional login credentials are stored only on your own device in local browser storage and are never sold or shared with third parties.

PERMISSIONS
• storage — Saves your Dark mode preference and optional Auto Login credentials locally in your browser.
• https://*.cuny.edu/* — Displays inline professor rating buttons, schedule copy actions, dark mode styling, and optional login autofill on CUNY portals.
• https://www.ratemyprofessors.com/* — Queries publicly available professor ratings when you click a "C+ RMP" badge.

SUPPORT
Found a bug or have a feature request? Open an issue at https://github.com/StevenHuangYH/CUNY-Plus/issues

Version 0.2.0 — Adds "Copy text" and "Copy table" actions in Schedule Builder, Quick access portal links in the popup, and full Dark mode support across CUNYfirst home, Student Center, CUNYfirst function pages, and Brightspace platform pages.

**Category**
Productivity

**Single Purpose**
Enhances CUNY student portals (CUNYfirst, Schedule Builder, and Brightspace) with inline RateMyProfessors ratings, schedule copying, dark mode, and optional sign-in autofill.

**Primary Language**
English

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Stores the user's Dark mode toggle preference and optional CUNY Login autofill settings locally on the user's device. |
| `https://*.cuny.edu/*` | host_permissions | Injects inline RateMyProfessors rating buttons and schedule copy actions on CUNY Schedule Builder, applies opt-in dark mode styling across CUNYfirst and Brightspace pages, and fills the CUNY SSO login form when Auto Login is enabled. |
| `https://www.ratemyprofessors.com/*` | host_permissions | Fetches public instructor search results and rating details from RateMyProfessors when the student clicks a professor rating button. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No (all preferences and optional credentials stay in local browser storage on the user's device and are only used on the user's own CUNY session).

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.2.0 | 2026-10-24 | Add displayed schedule copy actions (Copy text / Copy table), popup quick-access links, and full dark mode across CUNYfirst home, Student Center, CUNYfirst function pages, Schedule Builder, and Brightspace. | Ready |
| 0.1.3 | 2026-09-29 | Add persistent dark mode for the extension popup, Schedule Builder, and CUNY Login. | Published |
| 0.1.2 | 2026-09-27 | Improve professor identity matching with candidate selection and harden auto-login reliability. | Published |
| 0.1.1 | 2026-07-13 | Initial Chrome Web Store release with inline RateMyProfessors ratings and CUNY Auto Login. | Published |
