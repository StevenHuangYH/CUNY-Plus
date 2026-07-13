<div align="center">
  <h1>CUNY Plus</h1>
  <img src="assets/icon.png" alt="logo" style="width: 100px; border-radius: 15%; margin: 20px 0;" />
  <p><em>No more switching tabs between CUNY Schedule Builder and RateMyProfessors.</em></p>
</div>

---

**CUNY Plus** is a Chrome extension built specifically for students in the City University of New York (CUNY) system. It seamlessly integrates instructor ratings right into your class search, so you can build your schedule with confidence and speed.

## What it does

Instead of copying and pasting professor names into a new tab, CUNY Plus does the heavy lifting for you:

* **Instant RMP Ratings:** Injects a sleek "C+ RMP" button right next to every professor's name on CUNY class search and scheduling pages.
* **At-a-Glance Professor Profiles:** Clicking the badge opens a modern pop-up card showing the professor's overall quality score, difficulty rating, top student feedback tags, and how many students would take them again.
* **Smarter Name Matching:** We automatically filter out placeholders like *Staff* or *TBA*, strip titles like *Dr.* or *Prof.*, and prioritize matches from CUNY campuses (Baruch, Hunter, CCNY, etc.) if multiple professors share a name.
* **One-Click Auto Login:** Tired of typing your long `firstname.last##@login.cuny.edu` every time you log into CUNY SSO? Save it securely in the extension popup, and we'll auto-fill and submit it for you.

## How it works

The extension is built on top of the [Plasmo](https://docs.plasmo.com/) framework, using React and Tailwind CSS. We use Shadow DOM injection to make sure our UI components don't clash with the older styling of the CUNY portals. 

## Want to test it locally?

If you want to hack on this or just run it yourself:

1. Clone the repo and install dependencies with `npm install`.
2. Run `npm run dev` for a live-reloading development build, or `npm run build` for a production bundle.
3. Open `chrome://extensions/`, turn on **Developer mode**, click **Load unpacked**, and select the `build/chrome-mv3-prod` (or `dev`) folder.
4. Don't have a CUNY account handy? Just open `test.html` in your browser to see a mock version of the Schedule Builder table where the extension will actively inject the rating badges.

## Feedback & Contributions

If you find a bug, want a new feature, or just want to help out, feel free to open an issue or submit a pull request!
