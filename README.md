<div align="center">
  <h1>CUNY Plus</h1>
  <img src="assets/icon.png" alt="logo" style="width: 100px; border-radius: 15%" />
</div>

---

A browser extension that enhances the course registration experience for students across the City University of New York (CUNY) system. CUNY Plus injects real-time instructor ratings from **RateMyProfessors** directly into the **CUNY Schedule Builder**, and offers additional quality-of-life utilities to make the registration process smoother.

Built with
[Plasmo](https://docs.plasmo.com/),
[React](https://react.dev/), and
[Tailwind CSS](https://tailwindcss.com/).

<p align="center">
  <a href="#-installation">Installation</a>
  &bull;
  <a href="#-features">Features</a>
  &bull;
  <a href="#-contribution">Contribution</a>
  &bull;
  <a href="#-support">Support</a>
</p>

---

## 🤺 Installation

### Option 1: Compile Source Code 🛠️

1. Clone the repository:
    ```bash
    git clone https://github.com/StevenHuangYH/CUNY-Course-Rank-Catcher.git
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Build or run the source code:
    - **Development (Live-reload):**
      ```bash
      npm run dev
      ```
    - **Production build:**
      ```bash
      npm run build
      ```

4. Open `chrome://extensions/` in your browser, enable `Developer mode`, click `Load unpacked`, and select the build target folder:
   - `build/chrome-mv3-dev` (development mode)
   - `build/chrome-mv3-prod` (production build)

### Option 2: Local Simulation & Testing 🧪

To test the extension without a CUNY account:
1. Load the unpacked extension from one of the build folders above.
2. Open `test.html` in your browser — it mirrors the exact HTML structure of the real CUNY Schedule Builder.
3. The content script will automatically inject rating buttons next to the professor names in the mock table.

---

## 😎 Features

- [📊 Inline Rating Badges](#-inline-rating-badges)
- [🪪 Detailed Professor Cards](#-detailed-professor-cards)
- [🔑 Auto Login](#-auto-login)
- [🔍 Smart Campus Matching](#-smart-campus-matching)
- [🧹 Auto-Sanitization](#-auto-sanitization)
- <font color="orange">**Have a feature request? Open an issue on [GitHub](https://github.com/StevenHuangYH/CUNY-Course-Rank-Catcher/issues)!**</font>

### 📊 Inline Rating Badges

Automatically inserts a sleek **"C+ RMP"** button next to every professor name on CUNY class search and scheduling pages. Buttons are injected inside the page's Shadow DOM to prevent style conflicts with the host page.

### 🪪 Detailed Professor Cards

Clicking the badge fetches live data and displays an interactive pop-up card with:
- **Overall Quality Rating** — color-coded score out of 5.0 (green ≥ 4.0, amber ≥ 3.0, red < 3.0)
- **Difficulty Score** — out of 5.0
- **Would Take Again** — percentage of students who would re-enroll
- **Top Tags** — the most frequently mentioned student review tags
- **Review Count** — total number of ratings sampled
- **Full Profile Link** — quick link to the professor's complete RateMyProfessors page

The card auto-positions itself to stay within the viewport (flips above the button when there is not enough space below).

### 🔑 Auto Login

Stores your CUNY SSO credentials locally in Chrome's encrypted storage and automatically fills in the username and password fields on the `ssologin.cuny.edu` login page. Configure it through the extension popup:
- Toggle the **Auto Login** switch on/off
- Enter your CUNY username (e.g. `firstname.last##@login.cuny.edu`) and password
- Click **Save** — credentials are stored entirely on your device and never transmitted anywhere

A session guard prevents repeated login attempts if credentials are incorrect, avoiding redirect loops.

### 🔍 Smart Campus Matching

Searches RateMyProfessors globally and automatically prioritizes results from CUNY schools (Baruch, CCNY, Hunter, Brooklyn College, Queens College, etc.) when multiple professors share the same name.

### 🧹 Auto-Sanitization

Strips common title prefixes (*Dr.*, *Prof.*, *Professor*) before querying, and silently skips placeholder slots like *Staff*, *TBA*, *TBD*, or *To Be Announced* so no spurious buttons appear.

---

## 🪁 Contribution

Issues and pull requests are welcome! You're encouraged to:

- 📄 Improve the documentation
- ✨ Add new features
- 🪲 Fix bugs
- 💡 Suggest ideas or improvements

---

## ⭐ Support

If you enjoy using this extension, please:

- Give it a ⭐ on GitHub
- Recommend it to your classmates

Thank you for your support!
