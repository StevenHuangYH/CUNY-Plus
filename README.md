# ProfPulse (CUNY Course Rank Catcher)

ProfPulse is a browser extension designed to enhance the course registration experience for students across the City University of New York (CUNY) system. By seamlessly injecting real-time instructor ratings from **RateMyProfessors** directly into the **CUNY Schedule Builder**, ProfPulse empowers students to make informed, data-driven decisions during class enrollment.

---

## 🚀 Key Features

- **Inline UI Injection:** Automatically inserts a sleek, non-intrusive **"📊 View Rating"** badge next to professor names on CUNY class search and scheduling pages.
- **Detailed Rating Cards:** Clicking the badge reveals a modern, interactive modal inside the page's Shadow DOM, displaying:
  - **Overall Quality Rating:** Visual indicator color-coded (emerald green for excellent, amber/yellow for average, rose/red for poor).
  - **Difficulty Score:** Out of 5.0 scale.
  - **Student Feedback:** "Would Take Again" percentage.
  - **Review Count:** Visual confirmation of the sample size.
  - **Direct Profile Link:** Quick access to the professor's full RateMyProfessors page for read-up on student comments.
- **Smart Campus Matching:** Implements intelligent fallback filtering. It searches RMP globally and automatically maps to CUNY campuses (Baruch, CCNY, Hunter, Brooklyn, Queens College, etc.) if multiple professors share the same name.
- **Title & Placeholder Sanitization:** Cleans prefix titles like *Dr.*, *Prof.*, or *Professor*, and intelligently ignores empty entries or placeholder names such as *Staff*, *TBA*, *TBD*, or *To Be Announced*.
- **Local Sandbox Simulation:** Includes a built-in course registry simulator (`test.html`) matching CUNY's exact HTML architecture for rapid local testing without active portal credentials.

---

## 🛠️ Technology Stack

- **Framework:** [Plasmo](https://docs.plasmo.com/) — Next-generation browser extension development framework.
- **Library:** [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/) for highly-interactive, type-safe components.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (encapsulated safely within Shadow DOM to prevent host page style leakage).
- **Communication:** Manifest V3 Background Service Workers communicating via GraphQL to the RateMyProfessors public endpoint.

---

## 📦 Project Directory Structure

```text
├── assets/                  # Extension icons and static media assets
├── build/                   # Compiled browser bundles (dev/production)
├── src/
│   ├── background.ts        # Service worker handling RMP GraphQL requests
│   ├── content.tsx          # Content script injecting the React rating button
│   ├── popup.tsx            # Extension popup menu interface
│   ├── features/            # Shared features (e.g. Counter button component)
│   └── style.css            # Tailwind and custom extension styles
├── test.html                # Local test page simulating CUNY Schedule Builder
├── package.json             # NPM dependencies, scripts, and host permissions
└── tsconfig.json            # TypeScript configuration compiler options
```

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/CUNY-Course-Rank-Catcher.git
   cd CUNY-Course-Rank-Catcher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the live development server:
```bash
npm run dev
```

### Loading the Extension into Browser (Chrome / Edge / Brave)

1. Open your browser and navigate to the extensions page (e.g., `chrome://extensions/` in Chrome).
2. Toggle on **Developer Mode** (usually top-right).
3. Click on **Load unpacked**.
4. Select the build target folder: `build/chrome-mv3-dev` (or the folder corresponding to your target browser).

### Local Simulation & Testing

To test the extension without logging into a CUNY account, open `test.html` in your browser where the unpacked extension is running. The content script matches `file://*/*` and will inject the buttons next to "Hadley Black" and "Rosario Gennaro" in the mock registrar table.

---

## 🏗️ Production Build & Submission

### Generating the Production Bundle

Compile and optimize the extension for distribution:
```bash
npm run build
```
This produces a production bundle under `build/chrome-mv3-prod`.

### Packaging for Web Stores

Create a zip archive ready for uploads:
```bash
npm run package
```

### Automatic Deployment

This repository is pre-configured to support automated deployments to browser webstores using Plasmo's recommended [bpp (Browser Extension Publisher)](https://bpp.browser.market) workflow. See `.github/workflows/submit.yml` (if configured) or the [Plasmo Submission Docs](https://docs.plasmo.com/framework/workflows/submit) for detailed credentials setup.

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](file:///c:/Users/steve/Desktop/project/CUNY-Course-Rank-Catcher/LICENSE) file for details.
